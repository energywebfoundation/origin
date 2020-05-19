import { PreciseProofs } from 'precise-proofs-js';
import {
    CommitmentStatus,
    IOwnershipCommitment,
    MAX_ENERGY_PER_CERTIFICATE
} from '@energyweb/origin-backend-core';
import { Event as BlockchainEvent, ContractTransaction, ethers } from 'ethers';
import { BigNumber, bigNumberify } from 'ethers/utils';

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

    private privateOwnershipCommitment: IOwnershipCommitment = {};

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
            publicVolume: ownedEnergy.sub(claimedEnergy).lt(0)
                ? bigNumberify(0)
                : ownedEnergy.sub(claimedEnergy),
            privateVolume: this.privateOwnershipCommitment[owner] ?? bigNumberify(0),
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

    async migrateToPublic(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const migrationRequestId = await issuerWithSigner.getMigrationRequestId(this.id);
        const migrationRequest = await issuerWithSigner.getMigrationRequest(migrationRequestId);

        const requestor = migrationRequest.owner;
        const privateVolume = this.privateOwnershipCommitment[requestor];

        if (privateVolume.eq(0)) {
            throw new Error(
                `migrateToPublic(): Requestor doesn't own any private volume in certificate #${this.id}.`
            );
        }

        const { salts } = await this.getCommitment();

        const calculatedOffChainStorageProperties = this.generateAndAddProofs(
            this.privateOwnershipCommitment,
            salts
        );

        const theProof = PreciseProofs.createProof(
            requestor,
            calculatedOffChainStorageProperties.leafs,
            false
        );
        const onChainProof = theProof.proofPath.map((p) => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        const { salt } = theProof;
        const tx = await issuerWithSigner.migrateToPublic(
            migrationRequestId,
            privateVolume,
            salt,
            onChainProof
        );
        await tx.wait();

        return tx;
    }

    async transfer(
        to: string,
        amount?: BigNumber,
        privately = false
    ): Promise<ContractTransaction | CommitmentStatus> {
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
                proposedOwnerShares[toAddress] ?? new BigNumber(0)
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

    async approvePrivateTransfer(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const previousCommitment = this.propertiesDocumentHash;
        const newCommitmentProof = await this.getPendingTransferCommitment();
        const request = await issuerWithSigner.getPrivateTransferRequest(this.id);

        if (!request) {
            throw new Error(`approvePrivateTransfer(): no pending requests to approve.`);
        }

        const theProof = PreciseProofs.createProof(request.owner, newCommitmentProof.leafs, false);

        const onChainProof = theProof.proofPath.map((p) => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        this.propertiesDocumentHash = newCommitmentProof.rootHash;

        const tx = await issuerWithSigner.approvePrivateTransfer(
            this.id,
            onChainProof,
            previousCommitment,
            newCommitmentProof.rootHash
        );

        await tx.wait();
        await this.certificateClient.approvePendingOwnershipCommitment(this.id);

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
                const claimData = await decodeClaimData(claimEvent._claimData, this.configuration);

                claims.push({
                    id: claimEvent._id,
                    from: claimEvent._claimIssuer,
                    to: claimEvent._claimSubject,
                    topic: claimEvent._topic,
                    value: claimEvent._value,
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
                const claimIds = claimBatchEvent._ids.map((idAsBN: BigNumber) => idAsBN.toNumber());

                const index = claimIds.indexOf(this.id);
                const claimData = await decodeClaimData(
                    claimBatchEvent._claimData[index],
                    this.configuration
                );

                claims.push({
                    id: claimBatchEvent._ids[index],
                    from: claimBatchEvent._claimIssuer,
                    to: claimBatchEvent._claimSubject,
                    topic: claimBatchEvent._topics[index],
                    value: claimBatchEvent._values[index],
                    claimData
                });
            });

        return claims;
    }
}
