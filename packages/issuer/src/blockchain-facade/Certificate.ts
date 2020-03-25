import { TransactionReceipt, EventLog } from 'web3-core';
import { PreciseProofs } from 'precise-proofs-js';

import { Configuration, Timestamp } from '@energyweb/utils-general';

import { Registry, Issuer } from '..';
import { TransferSingleEvent, ClaimSingleEvent } from '../wrappedContracts/Registry';
import { PreciseProofEntity } from './PreciseProofEntity';
import { IOwnershipCommitment, CommitmentStatus } from '@energyweb/origin-backend-core';

export type IShareInCertificate = IOwnershipCommitment;

export interface IOwners {
    [address: string]: {
        owned: number,
        claimed: number
    }
}

export interface ICertificate {
    id: number;
    issuer: string;
    deviceId: string;
    energy: number;
    generationStartTime: number;
    generationEndTime: number;
    certificationRequestId: number;
    creationTime: number;
    creationBlockHash: string;
    owners: IOwners;
}

export class Entity extends PreciseProofEntity implements ICertificate {
    public deviceId: string;

    public energy: number;
    public generationStartTime: number;
    public generationEndTime: number;
    public issuer: string;
    public creationTime: number;
    public creationBlockHash: string;
    public ownershipCommitment: IOwnershipCommitment;
    public certificationRequestId: number;

    public initialized: boolean = false;
    public isPrivate: boolean;
    public data: number[];

    private ownedShares: IShareInCertificate = {};
    private claimedShares: IShareInCertificate = {};

    constructor(id: number, configuration: Configuration.Entity) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
        if (this.id === null) {
            return this;
        }

        const registry: Registry = this.configuration.blockchainProperties.registry;
        const certOnChain = await registry.getCertificate(Number(this.id));

        this.data = certOnChain.data;

        const issuer: Issuer = this.configuration.blockchainProperties.issuer;
        this.isPrivate = await issuer.isCertificatePrivate(Number(this.id), Configuration.getAccount(this.configuration));

        const decodedData = await issuer.decodeData(this.data);
        const allIssuanceEvents = await registry.getAllIssuanceSingleEvents({
            filter: { _id: this.id }
        });
        const creationBlock = await this.configuration.blockchainProperties.web3.eth.getBlock(
            allIssuanceEvents[0].blockNumber
        );

        this.generationStartTime = Number(decodedData['0']);
        this.generationEndTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.issuer = certOnChain.issuer;
        this.creationTime = Number(creationBlock.timestamp);
        this.creationBlockHash = creationBlock.hash;
        this.certificationRequestId = Number(
            await issuer.getCertificationRequestIdForCertificate(this.id)
        );

        this.claimedShares = await this.calculateClaims();

        if (this.isPrivate) {
            this.propertiesDocumentHash = await issuer.getCertificateCommitment(this.id);

            const { commitment } = await this.getCommitment();
            this.ownedShares = commitment;
        } else {
            this.ownedShares = await this.calculateOwnership();
        }

        const getShareSum = (shares: IShareInCertificate) => Object.keys(shares).map(owner => shares[owner]).reduce((a, b) => a + b, 0);
        this.energy = getShareSum(this.ownedShares) + getShareSum(this.claimedShares);

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
    }

    get owners(): IOwners {
        const owners: IOwners = {};

        for (const ownerAddress in Object.keys(this.ownedShares)) {
            if (!owners[ownerAddress]) {
                owners[ownerAddress] = {
                    owned: 0,
                    claimed: 0
                };
            }

            owners[ownerAddress].owned += this.ownedShares[ownerAddress];
        }

        for (const ownerAddress in Object.keys(this.claimedShares)) {
            if (!owners[ownerAddress]) {
                owners[ownerAddress] = {
                    owned: 0,
                    claimed: 0
                };
            }

            owners[ownerAddress].claimed += this.claimedShares[ownerAddress];
        }

        return owners; 
    }

    async claim(amount?: number): Promise<TransactionReceipt> {
        if (this.isPrivate) {
            throw new Error(
                `claim(): Can't claim private certificate. Please migrate it to a public certificate first.`
            );
        }

        const { randomHex, hexToBytes } = this.configuration.blockchainProperties.web3.utils;

        // TO-DO: replace with proper claim data
        const claimData = hexToBytes(randomHex(32));

        const registry: Registry = this.configuration.blockchainProperties.registry;
        const owner = this.configuration.blockchainProperties.activeUser.address;

        return registry.safeTransferAndClaimFrom(
            owner,
            owner,
            this.id,
            amount || this.ownedVolume(),
            this.data,
            claimData,
            Configuration.getAccount(this.configuration)
        );
    }

    async requestMigrateToPublic(): Promise<TransactionReceipt> {
        if (!this.isPrivate) {
            throw new Error('migrateToPublic(): Can only migrate private certificates to public.');
        }

        const owner = this.configuration.blockchainProperties.activeUser.address.toLowerCase();
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const ownerBalance = this.ownedVolume();

        if (!ownerBalance) {
            throw new Error(`requestMigrateToPublic(): ${owner} does not own a share in certificate ${this.id}`);
        }

        const { salts } = await this.getCommitment();
        const calculatedOffChainStorageProperties = this.generateAndAddProofs(this.ownedShares, salts);
        const ownerAddressLeafHash = calculatedOffChainStorageProperties.leafs.find(leaf => leaf.key === owner).hash;

        return issuer.requestMigrateToPublic(
            Number(this.id),
            ownerAddressLeafHash,
            Configuration.getAccount(this.configuration)
        );
    }

    async migrateToPublic() {
        if (!this.isPrivate) {
            throw new Error('migrateToPublic(): Can only migrate private certificates to public.');
        }

        const issuer: Issuer = this.configuration.blockchainProperties.issuer;
        const migrationRequestId = await issuer.getMigrationRequestId(
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
        const migrationRequest = await issuer.getMigrationRequest(
            migrationRequestId,
            Configuration.getAccount(this.configuration)
        );

        const { salts } = await this.getCommitment();

        const calculatedOffChainStorageProperties = this.generateAndAddProofs(
            this.ownedShares,
            salts
        );

        const theProof = PreciseProofs.createProof(
            migrationRequest.owner.toLowerCase(),
            calculatedOffChainStorageProperties.leafs,
            false
        );
        const onChainProof = theProof.proofPath.map(p => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        const { salt } = theProof;

        await issuer.migrateToPublic(
            migrationRequestId,
            this.ownedShares[migrationRequest.owner.toLowerCase()],
            salt,
            onChainProof,
            Configuration.getAccount(this.configuration)
        );

        this.isPrivate = false;
    }

    async transfer(to: string, amount?: number): Promise<TransactionReceipt | CommitmentStatus> {
        const fromAddress = this.configuration.blockchainProperties.activeUser.address.toLowerCase();
        const toAddress = to.toLowerCase();
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const senderBalance = this.ownedVolume();
        amount = amount ?? senderBalance;

        if (senderBalance === 0 || amount > senderBalance) {
            throw new Error(
                `transfer(): unable to send amount ${amount} Wh. Sender ${fromAddress} only has a balance of ${senderBalance} Wh`
            );
        }

        if (this.isPrivate) {
            const proposedOwnerShares = { ...this.ownedShares };
            proposedOwnerShares[fromAddress] -= amount;
            proposedOwnerShares[toAddress] = (proposedOwnerShares[toAddress] ?? 0) + amount;

            const commitmentProof = this.generateAndAddProofs(proposedOwnerShares);
            const ownerAddressLeafHash = commitmentProof.leafs.find(leaf => leaf.key === fromAddress).hash;

            const tx = await issuer.requestPrivateTransfer(
                this.id,
                ownerAddressLeafHash,
                Configuration.getAccount(this.configuration)
            );

            return this.saveCommitment({
                ...commitmentProof,
                txHash: tx.transactionHash
            });
        }

        const registry: Registry = this.configuration.blockchainProperties.registry;

        return registry.safeTransferFrom(
            fromAddress,
            toAddress,
            this.id,
            amount,
            this.data,
            Configuration.getAccount(this.configuration)
        );
    }

    async approvePrivateTransfer(): Promise<TransactionReceipt> {
        if (!this.isPrivate) {
            throw new Error('approvePrivateTransfer(): only for private certificates.');
        }

        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const previousCommitment = this.propertiesDocumentHash;
        const newCommitmentProof = await this.getPendingTransferCommitment();
        const request = await issuer.getPrivateTransferRequest(this.id, Configuration.getAccount(this.configuration));

        if (!request) {
            throw new Error(`approvePrivateTransfer(): no pending requests to approve.`);
        }

        const theProof = PreciseProofs.createProof(
            request.owner.toLowerCase(),
            newCommitmentProof.leafs,
            false
        );

        const onChainProof = theProof.proofPath.map(p => ({
            left: !!p.left,
            hash: p.left || p.right
        }));

        this.propertiesDocumentHash = newCommitmentProof.rootHash;

        const tx = issuer.approvePrivateTransfer(
            this.id,
            onChainProof,
            previousCommitment,
            newCommitmentProof.rootHash,
            Configuration.getAccount(this.configuration)
        );

        await this.certificateClient.approvePendingOwnershipCommitment(this.id);

        return tx;
    }

    async revoke(): Promise<TransactionReceipt> {
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;
        return issuer.revokeCertificate(
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return getAllCertificateEvents(this.id, this.configuration);
    }

    isOwned(byAddress?: string): boolean {
        const ownedVolume = this.ownedVolume(byAddress);

        return ownedVolume > 0;
    }

    ownedVolume(byAddress?: string): number {
        const owner = byAddress ?? this.configuration.blockchainProperties.activeUser.address;
        const owned = this.ownedShares[owner.toLowerCase()] ?? 0;
        return owned - this.claimedVolume(owner);
    }

    isClaimed(byAddress?: string): boolean {
        const claimedVolume = this.claimedVolume(byAddress);

        return claimedVolume > 0;
    }

    claimedVolume(byAddress?: string): number {
        const owner = byAddress ?? this.configuration.blockchainProperties.activeUser.address;
        return this.claimedShares[owner.toLowerCase()] ?? 0;
    }

    private async calculateOwnership(): Promise<IShareInCertificate> {
        if (this.isPrivate) {
            throw new Error('Can only calculate ownership for public certificates');
        }

        const ownedShares: IShareInCertificate = {};
        const registry: Registry = this.configuration.blockchainProperties.registry;

        let transferSingleEvents: TransferSingleEvent[] = (
            await registry.getAllTransferSingleEvents({
                filter: { _id: this.id.toString() }
            })
        )
            .filter(e => e.returnValues._id === this.id.toString())
            .map(e => e.returnValues as TransferSingleEvent);

        const transferBatchEvents = (await registry.getAllTransferBatchEvents()).map(
            e => e.returnValues
        );

        // Convert TransferBatch to TransferSingle event
        for (const event of transferBatchEvents.filter(e => e._ids.includes(this.id.toString()))) {
            for (let i = 0; i < event._ids.length; i++) {
                if (event._ids[i] === this.id.toString()) {
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
            const valueTransferred = Number(_value);

            if (_from !== '0x0000000000000000000000000000000000000000') {
                ownedShares[fromAddress] = ownedShares[fromAddress] - valueTransferred;
            }

            if (ownedShares[toAddress] === null || ownedShares[toAddress] === undefined) {
                ownedShares[toAddress] = 0;
            } 

            ownedShares[toAddress] += valueTransferred;
        }

        // Validate if all balances have been correctly calculated
        for (const ownerAddress of Object.keys(ownedShares)) {
            const ownedBalance = Number(await registry.balanceOf(ownerAddress, Number(this.id)));
            const calculatedBalance = ownedShares[ownerAddress] - (this.claimedShares[ownerAddress] ?? 0);

            if (ownedBalance != calculatedBalance) {
                throw new Error(`Non-matching owned balances. Please re-sync the certificate data.\nCalculated from events: ${calculatedBalance}\nRegistry.balanceOf(): ${ownedBalance}`)
            }
        }

        return ownedShares;
    }

    private async calculateClaims(): Promise<IShareInCertificate> {
        const claimedShares: IShareInCertificate = {};
        const registry: Registry = this.configuration.blockchainProperties.registry;

        let claimSingleEvents: ClaimSingleEvent[] = (
            await registry.getAllClaimSingleEvents({
                filter: { _id: this.id.toString() }
            })
        )
            .filter(e => e.returnValues._id === this.id.toString())
            .map(e => e.returnValues as ClaimSingleEvent);

        const claimBatchEvents = (await registry.getAllClaimBatchEvents()).map(e => e.returnValues);

        // Convert ClaimBatch to ClaimSingle event
        for (const event of claimBatchEvents.filter(e => e._ids.includes(this.id.toString()))) {
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
                claimedShares[claimSubject] = 0;
            } 

            claimedShares[claimSubject] += valueClaimed;
        }

        // Validate if all balances have been correctly calculated
        for (const ownerAddress of Object.keys(claimedShares)) {
            const claimedBalance = await registry.claimedBalanceOf(ownerAddress, Number(this.id));

            if (claimedBalance != claimedShares[ownerAddress]) {
                throw new Error(`Non-matching claimed balances. Please re-sync the certificate data.\nCalculated from events: ${claimedShares[ownerAddress]}\nRegistry.balanceOf(): ${claimedBalance}`)
            }
        }

        return claimedShares;
    }
}

export const createCertificate = async (
    to: string,
    value: number,
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity,
    isVolumePrivate: boolean = false
): Promise<Entity> => {
    const newEntity = new Entity(null, configuration);

    const getIdFromLogs = (logs: any): number =>
        configuration.blockchainProperties.web3.utils.hexToNumber(logs[0].topics[2]);

    const issuer: Issuer = configuration.blockchainProperties.issuer;

    const data = await issuer.encodeData(fromTime, toTime, deviceId);

    let tx: TransactionReceipt;

    if (isVolumePrivate) {
        const ownershipCommitment: IOwnershipCommitment = {
            [to.toLowerCase()]: value
        };

        const commitmentProof = newEntity.generateAndAddProofs(ownershipCommitment);

        tx = await issuer.issuePrivate(
            to,
            commitmentProof.rootHash,
            data,
            Configuration.getAccount(configuration)
        );

        newEntity.id = getIdFromLogs(tx.logs);
        newEntity.propertiesDocumentHash = commitmentProof.rootHash;

        await newEntity.saveCommitment({
            ...commitmentProof,
            txHash: tx.transactionHash
        });
    } else {
        tx = await issuer.issue(to, value, data, Configuration.getAccount(configuration));
        newEntity.id = getIdFromLogs(tx.logs);
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
    const certificatesPromises = certificateIds.map(certId =>
        new Entity(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const isOwnerPromise = certificates.map(cert => cert.isOwned());
    const owned = await Promise.all(isOwnerPromise);

    const ownsAllCertificates = owned.every(isOwned => isOwned === true);

    if (!ownsAllCertificates) {
        throw new Error(`You can only claim your own certificates`);
    }

    const valuesPromise = certificates.map(cert => cert.ownedVolume());
    const values = await Promise.all(valuesPromise);

    const { randomHex, hexToBytes } = configuration.blockchainProperties.web3.utils;
    // TO-DO: replace with proper claim data
    const claimData = certificates.map(cert => hexToBytes(randomHex(32)));
    const data = hexToBytes(randomHex(32));

    const { from } = Configuration.getAccount(configuration);

    return configuration.blockchainProperties.registry.safeBatchTransferAndClaimFrom(
        from,
        from,
        certificateIds,
        values,
        data,
        claimData,
        Configuration.getAccount(configuration)
    );
}

export async function transferCertificates(
    certificateIds: number[],
    to: string,
    configuration: Configuration.Entity
) {
    const certificatesPromises = certificateIds.map(certId =>
        new Entity(certId, configuration).sync()
    );
    const certificates = await Promise.all(certificatesPromises);

    const valuesPromise = certificates.map(cert => cert.ownedVolume());
    const values = await Promise.all(valuesPromise);

    const { randomHex, hexToBytes } = configuration.blockchainProperties.web3.utils;
    // TO-DO: replace with proper data
    const data = hexToBytes(randomHex(32));

    const { from } = Configuration.getAccount(configuration);

    return configuration.blockchainProperties.registry.safeBatchTransferFrom(
        from,
        to,
        certificateIds,
        values,
        data,
        Configuration.getAccount(configuration)
    );
}

export async function getAllCertificates(configuration: Configuration.Entity): Promise<Entity[]> {
    const issuer: Issuer = configuration.blockchainProperties.issuer;
    const totalRequests = await issuer.totalRequests();

    const certificatePromises = Array(Number(totalRequests))
        .fill(null)
        .map(async (item, index) => {
            const certId = await issuer.getCertificateIdForCertificationRequest(index + 1);
            return certId > 0 ? new Entity(certId, configuration).sync() : null;
        });

    const certificates = await Promise.all(certificatePromises);

    return certificates.filter(cert => cert !== null);
}

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<EventLog[]> => {
    const registry: Registry = configuration.blockchainProperties.registry;

    const allEvents = await registry.getAllEvents({
        topics: [
            null,
            configuration.blockchainProperties.web3.utils.padLeft(
                configuration.blockchainProperties.web3.utils.fromDecimal(certId),
                64,
                '0'
            )
        ],
        fromBlock: 0,
        toBlock: 'latest'
    });

    const returnEvents = [];

    for (const fullEvent of allEvents) {
        // we have to remove some false positives due to ERC721 interface
        if (fullEvent.event === 'Transfer') {
            if (fullEvent.returnValues.tokenId === `${certId}`) {
                returnEvents.push(fullEvent);
            }
        } else {
            returnEvents.push(fullEvent);
        }
    }

    // we also have to search
    if (certId !== 0) {
        const transferEvents = await registry.getAllTransferSingleEvents({
            topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                null,
                null,
                configuration.blockchainProperties.web3.utils.padLeft(
                    configuration.blockchainProperties.web3.utils.fromDecimal(certId),
                    64,
                    '0'
                )
            ],
            fromBlock: 0,
            toBlock: 'latest'
        });

        for (const transferEvent of transferEvents) {
            returnEvents.push(transferEvent);
        }
    }

    return returnEvents;
};

