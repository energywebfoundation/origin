import {
    IOwnershipCommitment,
    MAX_ENERGY_PER_CERTIFICATE,
    IOwnershipCommitmentStatus
} from '@energyweb/origin-backend-core';
import { Event as BlockchainEvent, ContractTransaction, ethers, BigNumber } from 'ethers';

import { Configuration, Timestamp } from '@energyweb/utils-general';

import { PreciseProofEntity } from './PreciseProofEntity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';
import { getEventsFromContract } from '../utils/events';
import { encodeClaimData, decodeClaimData } from './CertificateUtils';

const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export interface ICertificateEnergy {
    publicVolume: BigNumber;
    privateVolume: BigNumber;
    claimedVolume: BigNumber;
}

export interface IClaimData {
    beneficiary?: string;
    address?: string;
    region?: string;
    zipCode?: string;
    countryCode?: string;
}

export interface IClaim {
    id: number;
    from: string;
    to: string;
    topic: number;
    value: number;
    claimData: IClaimData;
}

export interface ICertificate {
    id: number;
    issuer: string;
    deviceId: string;
    energy: ICertificateEnergy;
    generationStartTime: number;
    generationEndTime: number;
    certificationRequestId: number;
    creationTime: number;
    creationBlockHash: string;

    isClaimed: boolean;
    isOwned: boolean;
    claims: IClaim[];
}

export class Certificate extends PreciseProofEntity implements ICertificate {
    public deviceId: string;

    public energy: ICertificateEnergy;

    public generationStartTime: number;

    public generationEndTime: number;

    public issuer: string;

    public creationTime: number;

    public creationBlockHash: string;

    public ownershipCommitment: IOwnershipCommitment;

    public certificationRequestId: number;

    public initialized = false;

    public data: string;

    public claims: IClaim[];

    public privateOwnershipCommitment: IOwnershipCommitment = {};

    constructor(id: number, configuration: Configuration.Entity) {
        super(id, configuration);
    }

    public static async create(
        to: string,
        value: BigNumber,
        fromTime: Timestamp,
        toTime: Timestamp,
        deviceId: string,
        configuration: Configuration.Entity,
        isVolumePrivate = false
    ): Promise<Certificate> {
        if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
            throw new Error(
                `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
            );
        }

        const newCertificate = new Certificate(null, configuration);

        const getIdFromEvents = (logs: BlockchainEvent[]): number =>
            Number(logs.find((log) => log.event === 'CertificationRequestApproved').topics[2]);

        const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
            Registry,
            Issuer
        >;
        const issuerWithSigner = issuer.connect(configuration.blockchainProperties.activeUser);

        const data = await issuer.encodeData(fromTime, toTime, deviceId);

        let tx: ContractTransaction;

        const properChecksumToAddress = ethers.utils.getAddress(to);

        if (isVolumePrivate) {
            const ownershipCommitment: IOwnershipCommitment = {
                [properChecksumToAddress]: value
            };

            const commitmentProof = newCertificate.generateAndAddProofs(ownershipCommitment);

            tx = await issuerWithSigner.issuePrivate(
                properChecksumToAddress,
                commitmentProof.rootHash,
                data
            );
            const { events } = await tx.wait();

            newCertificate.id = getIdFromEvents(events);
            newCertificate.propertiesDocumentHash = commitmentProof.rootHash;

            await newCertificate.saveCommitment({
                ...commitmentProof,
                txHash: tx.hash
            });
        } else {
            tx = await issuerWithSigner.issue(properChecksumToAddress, value, data);
            const { events } = await tx.wait();

            newCertificate.id = getIdFromEvents(events);
        }

        if (configuration.logger) {
            configuration.logger.info(`Certificate ${newCertificate.id} created`);
        }

        return newCertificate.sync();
    }

    async sync(): Promise<Certificate> {
        if (this.id === null) {
            return this;
        }

        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const certOnChain = await registry.getCertificate(this.id);

        this.data = certOnChain.data;

        this.claims = await this.getClaimedData();

        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const decodedData = await issuer.decodeData(this.data);

        const allIssuanceLogs = await getEventsFromContract(
            registry,
            registry.filters.IssuanceSingle(null, null, null)
        );
        const issuanceLog = allIssuanceLogs.filter(
            (event) => event._id.toString() === this.id.toString()
        )[0];
        const issuanceBlock = await registry.provider.getBlock(issuanceLog.blockHash);

        this.generationStartTime = Number(decodedData['0']);
        this.generationEndTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.issuer = certOnChain.issuer;
        this.creationTime = Number(issuanceBlock.timestamp);
        this.creationBlockHash = issuanceLog.blockHash;

        const certificationRequestApprovedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificationRequestApproved(null, null, this.id)
        );

        this.certificationRequestId = certificationRequestApprovedEvents[0]._id;
        this.propertiesDocumentHash = await issuer.getCertificateCommitment(this.id);

        if (this.propertiesDocumentHash !== NULL_HASH) {
            const { commitment } = await this.getCommitment();
            this.privateOwnershipCommitment = commitment ?? {};
        }

        const owner = await this.configuration.blockchainProperties.activeUser.getAddress();
        const ownedEnergy = await registry.balanceOf(owner, this.id);
        const claimedEnergy = await registry.claimedBalanceOf(owner, this.id);

        this.energy = {
            publicVolume: ownedEnergy,
            privateVolume: this.privateOwnershipCommitment[owner] ?? BigNumber.from(0),
            claimedVolume: claimedEnergy
        };

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
    }

    get isOwned(): boolean {
        if (!this.energy) {
            return false;
        }

        const { publicVolume, privateVolume } = this.energy;

        return publicVolume.add(privateVolume).gt(0);
    }

    get isClaimed(): boolean {
        if (!this.energy) {
            return false;
        }

        const { claimedVolume } = this.energy;

        return claimedVolume.gt(0);
    }

    async claim(claimData: IClaimData, amount?: BigNumber): Promise<ContractTransaction> {
        const { publicVolume, privateVolume } = this.energy;

        if (publicVolume.eq(0)) {
            throw new Error(
                privateVolume.eq(0)
                    ? `claim(): Unable to claim certificate. You do not own a share in the certificate.`
                    : `claim(): Can't claim private volumes. Please migrate some volume to public first.`
            );
        }

        if (amount && amount.gt(publicVolume)) {
            const totalOwned = publicVolume.add(privateVolume);

            throw new Error(
                `claim(): Can't claim ${amount} Wh. ${
                    totalOwned.lt(amount)
                        ? `You only own ${publicVolume} Wh.`
                        : `Please migrate ${amount.sub(publicVolume)} Wh from private to public.`
                }`
            );
        }

        const { activeUser } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const registryWithSigner = registry.connect(activeUser);

        const activeUserAddress = await activeUser.getAddress();

        const encodedClaimData = await encodeClaimData(claimData, this.configuration);

        const claimTx = await registryWithSigner.safeTransferAndClaimFrom(
            activeUserAddress,
            activeUserAddress,
            this.id,
            amount || publicVolume,
            this.data,
            encodedClaimData
        );

        await claimTx.wait();

        return claimTx;
    }

    async requestMigrateToPublic(): Promise<ContractTransaction> {
        const { privateVolume } = this.energy;

        if (privateVolume.eq(0)) {
            throw new Error('migrateToPublic(): No private volume owned.');
        }

        const { activeUser } = this.configuration.blockchainProperties;
        const owner = await activeUser.getAddress();
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(activeUser);

        const { salts } = await this.getCommitment();
        const calculatedOffChainStorageProperties = this.generateAndAddProofs(
            this.privateOwnershipCommitment,
            salts
        );
        const ownerAddressLeafHash = calculatedOffChainStorageProperties.leafs.find(
            (leaf) => leaf.key === owner
        ).hash;

        const tx = await issuerWithSigner.requestMigrateToPublic(this.id, ownerAddressLeafHash);
        await tx.wait();

        return tx;
    }

    async transfer(
        to: string,
        amount?: BigNumber,
        privately = false
    ): Promise<ContractTransaction | IOwnershipCommitmentStatus> {
        if (await this.isRevoked()) {
            throw new Error(`Unable to transfer Certificate #${this.id}. It has been revoked.`);
        }

        const { activeUser } = this.configuration.blockchainProperties;
        const fromAddress = await activeUser.getAddress();
        const toAddress = ethers.utils.getAddress(to);

        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(activeUser);

        const { publicVolume, privateVolume } = this.energy;

        const availableAmount = privately ? privateVolume : publicVolume;
        const amountToTransfer = amount ?? availableAmount;

        if (amountToTransfer.eq(0) || amountToTransfer.gt(availableAmount)) {
            throw new Error(
                `transfer(): unable to send amount ${amountToTransfer} Wh. Sender ${fromAddress} has a balance of ${publicVolume.add(
                    privateVolume
                )} Wh (public: ${publicVolume}, private: ${privateVolume})`
            );
        }

        if (privately) {
            const proposedOwnerShares = { ...this.privateOwnershipCommitment };
            proposedOwnerShares[fromAddress] = proposedOwnerShares[fromAddress].sub(
                amountToTransfer
            );
            proposedOwnerShares[toAddress] = (
                proposedOwnerShares[toAddress] ?? BigNumber.from(0)
            ).add(amountToTransfer);

            const commitmentProof = this.generateAndAddProofs(proposedOwnerShares);
            const ownerAddressLeafHash = commitmentProof.leafs.find(
                (leaf) => leaf.key === fromAddress
            ).hash;

            const tx = await issuerWithSigner.requestPrivateTransfer(this.id, ownerAddressLeafHash);
            await tx.wait();

            return this.saveCommitment({
                ...commitmentProof,
                txHash: tx.hash
            });
        }

        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const registryWithSigner = registry.connect(activeUser);

        const tx = await registryWithSigner.safeTransferFrom(
            fromAddress,
            toAddress,
            this.id,
            amountToTransfer,
            this.data
        );

        await tx.wait();

        return tx;
    }

    async revoke(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const tx = await issuerWithSigner.revokeCertificate(this.id);
        await tx.wait();

        return tx;
    }

    async isRevoked(): Promise<boolean> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const revokedEvents = await getEventsFromContract(
            issuer,
            issuer.filters.CertificateRevoked(this.id)
        );

        return revokedEvents.length > 0;
    }

    async getClaimedData(): Promise<IClaim[]> {
        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const claims: IClaim[] = [];

        const claimSingleEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimSingle(null, null, null, null, null, null)
        );

        claimSingleEvents
            .filter((claimEvent) => claimEvent._id.toNumber() === this.id)
            .forEach(async (claimEvent) => {
                const { _claimData, _id, _claimIssuer, _claimSubject, _topic, _value } = claimEvent;
                const claimData = await decodeClaimData(_claimData, this.configuration);

                claims.push({
                    id: _id,
                    from: _claimIssuer,
                    to: _claimSubject,
                    topic: _topic,
                    value: _value,
                    claimData
                });
            });

        const claimBatchEvents = await getEventsFromContract(
            registry,
            registry.filters.ClaimBatch(null, null, null, null, null, null)
        );

        claimBatchEvents
            .filter((claimBatchEvent) =>
                claimBatchEvent._ids.map((idAsBN: BigNumber) => idAsBN.toNumber()).includes(this.id)
            )
            .forEach(async (claimBatchEvent) => {
                const {
                    _ids,
                    _claimData,
                    _claimIssuer,
                    _claimSubject,
                    _topics,
                    _values
                } = claimBatchEvent;
                const claimIds = _ids.map((idAsBN: BigNumber) => idAsBN.toNumber());

                const index = claimIds.indexOf(this.id);
                const claimData = await decodeClaimData(_claimData[index], this.configuration);

                claims.push({
                    id: _ids[index],
                    from: _claimIssuer,
                    to: _claimSubject,
                    topic: _topics[index],
                    value: _values[index],
                    claimData
                });
            });

        return claims;
    }
}
