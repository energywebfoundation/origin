import { PreciseProofs } from 'precise-proofs-js';
import {
    CommitmentStatus,
    IOwnershipCommitment,
    MAX_ENERGY_PER_CERTIFICATE
} from '@energyweb/origin-backend-core';
import { ContractTransaction, Event as BlockchainEvent } from 'ethers';
import { BigNumber, randomBytes } from 'ethers/utils';

import { Configuration, Timestamp } from '@energyweb/utils-general';

import { PreciseProofEntity } from './PreciseProofEntity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Registry } from '../ethers/Registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Issuer } from '../ethers/Issuer';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export interface IShareInCertificate {
    [address: string]: BigNumber;
}

export interface IOwners {
    [address: string]: {
        owned: BigNumber;
        ownedPrivate: BigNumber;
        claimed: BigNumber;
    };
}

export interface IOwnedVolumes {
    publicVolume: BigNumber;
    privateVolume: BigNumber;
}

export interface ICertificate {
    id: number;
    issuer: string;
    deviceId: string;
    energy: BigNumber;
    generationStartTime: number;
    generationEndTime: number;
    certificationRequestId: number;
    creationTime: number;
    creationBlockHash: string;
    owners: IOwners;
}

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<BlockchainEvent[]> => {
    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const allEventTypesFilter = registry.filters.TransferSingle(null, null, null, null, null);
    const allEvents = (
        await registry.provider.getLogs({
            ...allEventTypesFilter,
            fromBlock: 0,
            toBlock: 'latest'
        })
    ).map((log) => registry.interface.parseLog(log).values);

    return allEvents.filter((event) => event._id === certId);
};

export class Entity extends PreciseProofEntity implements ICertificate {
    public deviceId: string;

    public energy: BigNumber;

    public generationStartTime: number;

    public generationEndTime: number;

    public issuer: string;

    public creationTime: number;

    public creationBlockHash: string;

    public ownershipCommitment: IOwnershipCommitment;

    public certificationRequestId: number;

    public initialized = false;

    public data: string;

    private claimedShares: IShareInCertificate = {};

    private ownedShares: IShareInCertificate = {};

    private ownedSharesPrivate: IShareInCertificate = {};

    constructor(id: number, configuration: Configuration.Entity) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
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

        this.claimedShares = await this.calculateClaims();
        this.ownedShares = await this.calculateOwnership();

        this.propertiesDocumentHash = await issuer.getCertificateCommitment(this.id);

        if (this.propertiesDocumentHash !== NULL_HASH) {
            const { commitment } = await this.getCommitment();
            this.ownedSharesPrivate = commitment ?? {};
        }

        const getShareSum = (shares: IShareInCertificate) =>
            Object.keys(shares)
                .map((owner) => shares[owner])
                .reduce((a, b) => a.add(b), new BigNumber(0));
        this.energy = getShareSum(this.ownedShares).add(getShareSum(this.claimedShares));

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
    }

    get owners(): IOwners {
        const owners: IOwners = {};

        const allOwnerAddresses = [
            ...new Set([
                ...Object.keys(this.ownedShares),
                ...Object.keys(this.ownedSharesPrivate),
                ...Object.keys(this.claimedShares)
            ])
        ];

        for (const ownerAddress of allOwnerAddresses) {
            const zero = new BigNumber(0);

            if (!owners[ownerAddress]) {
                owners[ownerAddress] = {
                    owned: zero,
                    ownedPrivate: zero,
                    claimed: zero
                };
            }

            const { owned, ownedPrivate, claimed } = owners[ownerAddress];

            owners[ownerAddress].owned = owned.add(this.ownedShares[ownerAddress] ?? zero);
            owners[ownerAddress].ownedPrivate = ownedPrivate.add(
                this.ownedSharesPrivate[ownerAddress] ?? zero
            );
            owners[ownerAddress].claimed = claimed.add(this.claimedShares[ownerAddress] ?? zero);
        }

        return owners;
    }

    async claim(amount?: BigNumber): Promise<ContractTransaction> {
        const { publicVolume, privateVolume } = await this.ownedVolume();

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
        const { privateVolume } = await this.ownedVolume();

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
            this.ownedSharesPrivate,
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
        const { privateVolume } = await this.ownedVolume(requestor);

        if (privateVolume.eq(0)) {
            throw new Error(
                `migrateToPublic(): Requestor doesn't own any private volume in certificate #${this.id}.`
            );
        }

        const { salts } = await this.getCommitment();

        const calculatedOffChainStorageProperties = this.generateAndAddProofs(
            this.ownedSharesPrivate,
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

        const { publicVolume, privateVolume } = await this.ownedVolume();

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
            const proposedOwnerShares = { ...this.ownedSharesPrivate };
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

    async getAllCertificateEvents(): Promise<BlockchainEvent[]> {
        return getAllCertificateEvents(this.id, this.configuration);
    }

    async isOwned(byAddress?: string): Promise<boolean> {
        const { publicVolume, privateVolume } = await this.ownedVolume(byAddress);

        return publicVolume.add(privateVolume).gt(0);
    }

    async ownedVolume(byAddress?: string): Promise<IOwnedVolumes> {
        const owner =
            byAddress ?? (await this.configuration.blockchainProperties.activeUser.getAddress());
        const ownerBalances = this.owners[owner.toLowerCase()];
        const claimedVolume = await this.claimedVolume(owner);

        return {
            publicVolume: (ownerBalances?.owned ?? new BigNumber(0)).sub(claimedVolume),
            privateVolume: ownerBalances?.ownedPrivate ?? new BigNumber(0)
        };
    }

    async isClaimed(byAddress?: string): Promise<boolean> {
        const claimedVolume = await this.claimedVolume(byAddress);

        return claimedVolume.gt(0);
    }

    async claimedVolume(byAddress?: string): Promise<BigNumber> {
        const owner =
            byAddress ?? (await this.configuration.blockchainProperties.activeUser.getAddress());
        return this.claimedShares[owner.toLowerCase()] ?? new BigNumber(0);
    }

    private async calculateOwnership(): Promise<IShareInCertificate> {
        const ownedShares: IShareInCertificate = {};
        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const transferSingleFilter = registry.filters.TransferSingle(null, null, null, null, null);
        const transferSingleEvents = (
            await registry.provider.getLogs({
                ...transferSingleFilter,
                fromBlock: 0,
                toBlock: 'latest'
            })
        )
            .map((log) => registry.interface.parseLog(log).values)
            .filter((event) => event._id.eq(this.id));

        const transferBatchFilter = registry.filters.TransferBatch(null, null, null, null, null);
        const transferBatchEvents = (
            await registry.provider.getLogs({
                ...transferBatchFilter,
                fromBlock: 0,
                toBlock: 'latest'
            })
        )
            .map((log) => registry.interface.parseLog(log).values)
            .filter((e) => e._ids.some((id: BigNumber) => id.eq(this.id)));

        // Convert TransferBatch to TransferSingle event
        for (const event of transferBatchEvents) {
            for (let i = 0; i < event._ids.length; i++) {
                if (event._ids[i].eq(this.id)) {
                    transferSingleEvents.push({
                        _id: event._ids[i],
                        _operator: event._operator,
                        _to: event._to,
                        _from: event._from,
                        _value: event._values[i]
                    });
                }
            }
        }

        for (const event of transferSingleEvents) {
            const { _from, _to, _value } = event;
            const fromAddress = _from.toLowerCase();
            const toAddress = _to.toLowerCase();

            if (_from !== NULL_ADDRESS) {
                ownedShares[fromAddress] = ownedShares[fromAddress].sub(_value);
            }

            if (ownedShares[toAddress] === null || ownedShares[toAddress] === undefined) {
                ownedShares[toAddress] = new BigNumber(0);
            }

            ownedShares[toAddress] = ownedShares[toAddress].add(_value);
        }

        // Validate if all balances have been correctly calculated
        for (const ownerAddress of Object.keys(ownedShares)) {
            const ownedBalance = await registry.balanceOf(ownerAddress, this.id);
            const calculatedBalance = ownedShares[ownerAddress].sub(
                this.claimedShares[ownerAddress] ?? 0
            );

            if (!ownedBalance.eq(calculatedBalance)) {
                throw new Error(
                    `Non-matching owned balances. Please re-sync the certificate data.\nCalculated from events: ${calculatedBalance.toString()}\nRegistry.balanceOf(): ${ownedBalance.toString()}`
                );
            }
        }

        return ownedShares;
    }

    private async calculateClaims(): Promise<IShareInCertificate> {
        const claimedShares: IShareInCertificate = {};
        const { registry } = this.configuration
            .blockchainProperties as Configuration.BlockchainProperties<Registry, Issuer>;

        const claimSingleFilter = registry.filters.ClaimSingle(null, null, null, null, null, null);
        const claimSingleEvents = (
            await registry.provider.getLogs({
                ...claimSingleFilter,
                fromBlock: 0,
                toBlock: 'latest'
            })
        )
            .map((log) => registry.interface.parseLog(log).values)
            .filter((event) => event._id.eq(this.id));

        const claimBatchFilter = registry.filters.ClaimBatch(null, null, null, null, null, null);
        const claimBatchEvents = (
            await registry.provider.getLogs({
                ...claimBatchFilter,
                fromBlock: 0,
                toBlock: 'latest'
            })
        )
            .map((log) => registry.interface.parseLog(log).values)
            .filter((e) => e._ids.some((id: BigNumber) => id.eq(this.id)));

        // Convert ClaimBatch to ClaimSingle event
        for (const event of claimBatchEvents) {
            for (let i = 0; i < event._ids.length; i++) {
                if (event._ids[i] === this.id.toString()) {
                    claimSingleEvents.push({
                        _claimIssuer: event._claimIssuer,
                        _claimSubject: event._claimSubject,
                        _topic: event._topics[i],
                        _id: event._ids[i],
                        _value: event._values[i],
                        _claimData: event._claimData[i]
                    });
                }
            }
        }

        for (const event of claimSingleEvents) {
            const { _claimSubject, _value } = event;
            const claimSubject = _claimSubject.toLowerCase();
            const valueClaimed = Number(_value);

            if (claimedShares[claimSubject] === null || claimedShares[claimSubject] === undefined) {
                claimedShares[claimSubject] = new BigNumber(0);
            }

            claimedShares[claimSubject] = claimedShares[claimSubject].add(valueClaimed);
        }

        // Validate if all balances have been correctly calculated
        for (const ownerAddress of Object.keys(claimedShares)) {
            const claimedBalance = await registry.claimedBalanceOf(ownerAddress, this.id);

            if (!claimedBalance.eq(claimedShares[ownerAddress])) {
                throw new Error(
                    `Non-matching claimed balances. Please re-sync the certificate data.\nCalculated from events: ${claimedShares[ownerAddress]}\nRegistry.claimedBalanceOf(): ${claimedBalance}`
                );
            }
        }

        return claimedShares;
    }
}

export const createCertificate = async (
    to: string,
    value: BigNumber,
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    isVolumePrivate = false
): Promise<Entity> => {
    if (value.gt(MAX_ENERGY_PER_CERTIFICATE)) {
        throw new Error(
            `Too much energy requested. Requested: ${value}, Max: ${MAX_ENERGY_PER_CERTIFICATE}`
        );
    }

    const newEntity = new Entity(null, configuration);

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

        const commitmentProof = newEntity.generateAndAddProofs(ownershipCommitment);

        tx = await issuerWithSigner.issuePrivate(to, commitmentProof.rootHash, data);
        const { events } = await tx.wait();

        newEntity.id = getIdFromEvents(events);
        newEntity.propertiesDocumentHash = commitmentProof.rootHash;

        await newEntity.saveCommitment({
            ...commitmentProof,
            txHash: tx.hash
        });
    } else {
        tx = await issuerWithSigner.issue(to, value, data);
        const { events } = await tx.wait();

        newEntity.id = getIdFromEvents(events);
    }

    if (configuration.logger) {
        configuration.logger.info(`Certificate ${newEntity.id} created`);
    }

    return newEntity.sync();
};

export async function claimCertificates(
    certificateIds: number[],
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map((certId) =>
        new Entity(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const ownedPromises = certificates.map((cert) => cert.isOwned());
    const owned = await Promise.all(ownedPromises);

    const ownsAllCertificates = owned.every((isOwned) => isOwned === true);

    if (!ownsAllCertificates) {
        throw new Error(`You can only claim your own certificates`);
    }

    const ownedVolumesPromises = certificates.map((cert) => cert.ownedVolume());
    const ownedVolumes = await Promise.all(ownedVolumesPromises);
    const values = ownedVolumes.map((ownedVolume) => ownedVolume.publicVolume);

    // TO-DO: replace with proper claim data
    const claimData = certificates.map(() => randomBytes(32));
    const data = randomBytes(32);

    const { activeUser } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();

    return registryWithSigner.safeBatchTransferAndClaimFrom(
        activeUserAddress,
        activeUserAddress,
        certificateIds,
        values,
        data,
        claimData
    );
}

export async function transferCertificates(
    certificateIds: number[],
    to: string,
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map((certId) =>
        new Entity(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const ownedVolumesPromises = certificates.map((cert) => cert.ownedVolume());
    const ownedVolumes = await Promise.all(ownedVolumesPromises);
    const values = ownedVolumes.map((ownedVolume) => ownedVolume.publicVolume);

    // TO-DO: replace with proper data
    const data = randomBytes(32);

    const { activeUser } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;

    const { registry } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const registryWithSigner = registry.connect(activeUser);

    const activeUserAddress = await activeUser.getAddress();

    return registryWithSigner.safeBatchTransferFrom(
        activeUserAddress,
        to,
        certificateIds,
        values,
        data
    );
}

export async function getAllCertificates(configuration: Configuration.Entity): Promise<Entity[]> {
    const { issuer } = configuration.blockchainProperties as Configuration.BlockchainProperties<
        Registry,
        Issuer
    >;
    const totalRequests = (await issuer.totalRequests()).toNumber();

    const certificatePromises = Array(totalRequests)
        .fill(null)
        .map(async (item, index) => {
            const certId = await issuer.getCertificateIdForCertificationRequest(index + 1);
            return certId.gt(0) ? new Entity(certId.toNumber(), configuration).sync() : null;
        });

    const certificates = await Promise.all(certificatePromises);

    return certificates.filter((cert) => cert !== null);
}
