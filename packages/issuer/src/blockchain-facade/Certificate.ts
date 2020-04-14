import { PreciseProofs } from 'precise-proofs-js';
import {
    CommitmentStatus,
    IOwnershipCommitment,
    MAX_ENERGY_PER_CERTIFICATE
} from '@energyweb/origin-backend-core';
import { Event as BlockchainEvent, ContractTransaction } from 'ethers';
import { BigNumber, randomBytes, bigNumberify } from 'ethers/utils';

import { Configuration, Timestamp } from '@energyweb/utils-general';

import { PreciseProofEntity } from './PreciseProofEntity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';

const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export interface ICertificateEnergy {
    publicVolume: BigNumber;
    privateVolume: BigNumber;
    claimedVolume: BigNumber;
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
            Number(logs.find((log) => log.event === 'ApprovedCertificationRequest').topics[2]);

        const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
            Registry,
            Issuer
        >;
        const issuerWithSigner = issuer.connect(configuration.blockchainProperties.activeUser);

        const data = await issuer.encodeData(fromTime, toTime, deviceId);

        let tx: ContractTransaction;

        if (isVolumePrivate) {
            const ownershipCommitment: IOwnershipCommitment = {
                [to.toLowerCase()]: value
            };

            console.log({
                ownershipCommitment
            });

            const commitmentProof = newCertificate.generateAndAddProofs(ownershipCommitment);

            tx = await issuerWithSigner.issuePrivate(to, commitmentProof.rootHash, data);
            const { events } = await tx.wait();

            newCertificate.id = getIdFromEvents(events);
            newCertificate.propertiesDocumentHash = commitmentProof.rootHash;

            await newCertificate.saveCommitment({
                ...commitmentProof,
                txHash: tx.hash
            });
        } else {
            console.log({
                value
            });
            tx = await issuerWithSigner.issue(to, value, data);
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

        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const decodedData = await issuer.decodeData(this.data);

        const issuanceSingleFilter = registry.filters.IssuanceSingle(null, null, this.id);
        const issuanceLogs = await registry.provider.getLogs({
            ...issuanceSingleFilter,
            fromBlock: 0,
            toBlock: 'latest'
        });
        const issuanceBlock = await registry.provider.getBlock(issuanceLogs[0].blockHash);

        this.generationStartTime = Number(decodedData['0']);
        this.generationEndTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.issuer = certOnChain.issuer;
        this.creationTime = Number(issuanceBlock.timestamp);
        this.creationBlockHash = issuanceLogs[0].blockHash;
        this.certificationRequestId = Number(
            await issuer.getCertificationRequestIdForCertificate(this.id)
        );

        this.propertiesDocumentHash = await issuer.getCertificateCommitment(this.id);

        if (this.propertiesDocumentHash !== NULL_HASH) {
            const { commitment } = await this.getCommitment();
            this.privateOwnershipCommitment = commitment ?? {};
        }

        const owner = (
            await this.configuration.blockchainProperties.activeUser.getAddress()
        ).toLowerCase();
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

    async claim(amount?: BigNumber): Promise<ContractTransaction> {
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

        // TO-DO: replace with proper claim data
        const claimData = randomBytes(32);

        const { activeUser } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const registryWithSigner = registry.connect(activeUser);

        const activeUserAddress = await activeUser.getAddress();

        return registryWithSigner.safeTransferAndClaimFrom(
            activeUserAddress,
            activeUserAddress,
            this.id,
            amount || publicVolume,
            this.data,
            claimData
        );
    }

    async requestMigrateToPublic(): Promise<ContractTransaction> {
        const { privateVolume } = this.energy;

        if (privateVolume.eq(0)) {
            throw new Error('migrateToPublic(): No private volume owned.');
        }

        const { activeUser } = this.configuration.blockchainProperties;
        const owner = (await activeUser.getAddress()).toLowerCase();
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

        return issuerWithSigner.requestMigrateToPublic(this.id, ownerAddressLeafHash);
    }

    async migrateToPublic(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        const migrationRequestId = await issuerWithSigner.getMigrationRequestId(this.id);
        const migrationRequest = await issuerWithSigner.getMigrationRequest(migrationRequestId);

        const requestor = migrationRequest.owner.toLowerCase();
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

        return issuerWithSigner.migrateToPublic(
            migrationRequestId,
            privateVolume,
            salt,
            onChainProof
        );
    }

    async transfer(
        to: string,
        amount?: BigNumber,
        privately = false
    ): Promise<ContractTransaction | CommitmentStatus> {
        const { activeUser } = this.configuration.blockchainProperties;
        const fromAddress = (await activeUser.getAddress()).toLowerCase();
        const toAddress = to.toLowerCase();

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

            return this.saveCommitment({
                ...commitmentProof,
                txHash: tx.hash
            });
        }

        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const registryWithSigner = registry.connect(activeUser);

        return registryWithSigner.safeTransferFrom(
            fromAddress,
            toAddress,
            this.id,
            amountToTransfer,
            this.data
        );
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

        const theProof = PreciseProofs.createProof(
            request.owner.toLowerCase(),
            newCommitmentProof.leafs,
            false
        );

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

        await this.certificateClient.approvePendingOwnershipCommitment(this.id);

        return tx;
    }

    async revoke(): Promise<ContractTransaction> {
        const { issuer } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;
        const issuerWithSigner = issuer.connect(this.configuration.blockchainProperties.activeUser);

        return issuerWithSigner.revokeCertificate(this.id);
    }
}
