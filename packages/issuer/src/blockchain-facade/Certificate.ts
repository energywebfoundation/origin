import { TransactionReceipt, EventLog } from 'web3-core';
import { PreciseProofs } from 'precise-proofs-js';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';

import { Registry, Issuer, OwnershipCommitmentSchema } from '..';
import { TransferSingleEvent, ClaimSingleEvent } from '../wrappedContracts/Registry';
import { IOwnershipCommitment } from './IOwnershipCommitment';

export interface IOwnedShares {
    [address: string]: {
        owned: number;
        claimed: number;
    };
}
export interface ICertificate {
    id: string;
    issuer: string;
    deviceId: string;
    energy: number;
    generationStartTime: number;
    generationEndTime: number;
    certificationRequestId: number;
    creationTime: number;
    creationBlockHash: string;
    owners?: IOwnedShares;
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

export class Entity extends BlockchainDataModelEntity.Entity implements ICertificate {
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

    private ownedShares: IOwnedShares = {};

    constructor(id: string, configuration: Configuration.Entity) {
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
        this.isPrivate = await issuer.isCertificatePublic(Number(this.id));

        const decodedData = await issuer.decodeData(this.data);
        const allIssuanceEvents = await registry.getAllIssuanceSingleEvents({
            filter: { _id: Number(this.id) }
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
            await issuer.getCertificationRequestIdForCertificate(Number(this.id))
        );

        if (this.isPrivate) {
            this.ownershipCommitment = await this.getOffChainProperties();
            this.ownedShares = {
                [this.ownershipCommitment.ownerAddress.toLowerCase()]: {
                    owned: this.ownershipCommitment.volume,
                    claimed: 0
                }
            };
        } else {
            this.ownedShares = await this.calculateOwnership();
        }

        this.energy = Object.keys(this.ownedShares)
            .map(owner => this.ownedShares[owner].owned)
            .reduce((a, b) => a + b, 0);

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
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
            parseInt(this.id, 10),
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

        const owner = this.configuration.blockchainProperties.activeUser.address;
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;

        const ownerBalance = this.ownedVolume();

        if (!ownerBalance || this.ownedShares[owner]) {
            throw new Error(`transfer(): ${owner} does not own a share in certificate ${this.id}`);
        }

        const { salts } = await this.getOffChainDump();

        const calculatedOffChainStorageProperties = this.prepareEntityCreation(
            this.ownershipCommitment,
            OwnershipCommitmentSchema,
            salts
        );

        return issuer.requestMigrateToPublic(
            Number(this.id),
            calculatedOffChainStorageProperties.leafs[1].hash,
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

        const { salts } = await this.getOffChainDump();

        const calculatedOffChainStorageProperties = this.prepareEntityCreation(
            this.ownershipCommitment,
            OwnershipCommitmentSchema,
            salts
        );

        const theProof = PreciseProofs.createProof(
            'ownerAddress',
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
            this.ownershipCommitment.volume,
            salt,
            onChainProof,
            Configuration.getAccount(this.configuration)
        );

        this.isPrivate = false;
    }

    async transfer(to: string, amount?: number): Promise<TransactionReceipt> {
        const from = this.configuration.blockchainProperties.activeUser.address;

        if (this.isPrivate) {
            const senderBalance = this.ownedVolume();

            if (!senderBalance || this.ownedShares[from]) {
                throw new Error(
                    `transfer(): ${from} does not own a share in certificate ${this.id}`
                );
            }

            if (amount && amount !== senderBalance) {
                throw new Error(
                    `transfer(): unable to send amount ${amount} Wh. For private certificate you can only send the full balance of ${senderBalance} Wh`
                );
            }

            const previousCommitment = this.propertiesDocumentHash;

            const ownershipCommitment: IOwnershipCommitment = {
                ownerAddress: to,
                volume: this.ownedVolume()
            };
            const updatedOwnershipProperties = this.prepareEntityCreation(
                ownershipCommitment,
                OwnershipCommitmentSchema
            );
            await this.syncOffChainStorage(ownershipCommitment, updatedOwnershipProperties);

            const issuer: Issuer = this.configuration.blockchainProperties.issuer;
            const { logs } = await issuer.requestPrivateTransfer(
                Number(this.id),
                updatedOwnershipProperties.leafs[1].hash,
                Configuration.getAccount(this.configuration)
            );

            const privateTransferRequestId = this.configuration.blockchainProperties.web3.utils.hexToNumber(
                logs[0].topics[3]
            );

            const theProof = PreciseProofs.createProof(
                'ownerAddress',
                updatedOwnershipProperties.leafs,
                false
            );
            const onChainProof = theProof.proofPath.map(p => ({
                left: !!p.left,
                hash: p.left || p.right
            }));

            this.propertiesDocumentHash = updatedOwnershipProperties.rootHash;

            return issuer.approvePrivateTransfer(
                privateTransferRequestId,
                onChainProof,
                previousCommitment,
                updatedOwnershipProperties.rootHash,
                Configuration.getAccount(this.configuration)
            );
        }

        const registry: Registry = this.configuration.blockchainProperties.registry;

        return registry.safeTransferFrom(
            from,
            to,
            parseInt(this.id, 10),
            amount ?? this.ownedVolume(),
            this.data,
            Configuration.getAccount(this.configuration)
        );
    }

    async revoke(): Promise<TransactionReceipt> {
        const issuer: Issuer = this.configuration.blockchainProperties.issuer;
        return issuer.revokeCertificate(
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return getAllCertificateEvents(parseInt(this.id, 10), this.configuration);
    }

    isOwned(byAddress?: string): boolean {
        const ownedVolume = this.ownedVolume(byAddress);

        return ownedVolume > 0;
    }

    ownedVolume(byAddress?: string): number {
        const owner = byAddress ?? this.configuration.blockchainProperties.activeUser.address;
        const ownedShare = this.ownedShares[owner.toLowerCase()];
        return ownedShare ? ownedShare.owned - ownedShare.claimed : 0;
    }

    isClaimed(byAddress?: string): boolean {
        const claimedVolume = this.claimedVolume(byAddress);

        return claimedVolume > 0;
    }

    claimedVolume(byAddress?: string): number {
        const owner = byAddress ?? this.configuration.blockchainProperties.activeUser.address;
        const ownedShare = this.ownedShares[owner.toLowerCase()];
        return ownedShare ? ownedShare.claimed : 0;
    }

    private async calculateOwnership(): Promise<IOwnedShares> {
        if (this.isPrivate) {
            throw new Error('Can only calculate ownership for public certificates');
        }

        const ownedShares: IOwnedShares = {};
        const registry: Registry = this.configuration.blockchainProperties.registry;

        let transferSingleEvents: TransferSingleEvent[] = (
            await registry.getAllTransferSingleEvents({
                filter: { _id: this.id }
            })
        )
            .filter(e => e.returnValues._id === this.id)
            .map(e => e.returnValues as TransferSingleEvent);

        const transferBatchEvents = (await registry.getAllTransferBatchEvents()).map(
            e => e.returnValues
        );

        // Convert TransferBatch to TransferSingle event
        for (const event of transferBatchEvents.filter(e => e._ids.includes(this.id))) {
            for (let i = 0; i < event._ids.length; i++) {
                if (event._ids[i] === this.id) {
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
                ownedShares[fromAddress].owned = ownedShares[fromAddress].owned - valueTransferred;
            }

            if (ownedShares[toAddress] === null || ownedShares[toAddress] === undefined) {
                ownedShares[toAddress] = {
                    owned: 0,
                    claimed: 0
                };
            }

            ownedShares[toAddress].owned += valueTransferred;
        }

        let claimSingleEvents: ClaimSingleEvent[] = (
            await registry.getAllClaimSingleEvents({
                filter: { _id: this.id }
            })
        )
            .filter(e => e.returnValues._id === this.id)
            .map(e => e.returnValues as ClaimSingleEvent);

        const claimBatchEvents = (await registry.getAllClaimBatchEvents()).map(e => e.returnValues);

        // Convert ClaimBatch to ClaimSingle event
        for (const event of claimBatchEvents.filter(e => e._ids.includes(this.id))) {
            for (let i = 0; i < event._ids.length; i++) {
                if (event._ids[i] === this.id) {
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

            if (ownedShares[claimSubject] === null || ownedShares[claimSubject] === undefined) {
                ownedShares[claimSubject] = {
                    owned: 0,
                    claimed: 0
                };
            }

            ownedShares[claimSubject].claimed += valueClaimed;
        }

        // Validate if all balances have been correctly calculated
        for (const ownerAddress of Object.keys(ownedShares)) {
            const ownerBalance = await registry.balanceOf(ownerAddress, Number(this.id));
            const calculatedBalance =
                ownedShares[ownerAddress].owned - ownedShares[ownerAddress].claimed;
            if (calculatedBalance != ownerBalance) {
                throw new Error('Non-matching balances. Please re-sync the certificate data.');
            }
        }

        return ownedShares;
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

    const getIdFromLogs = (logs: any) =>
        configuration.blockchainProperties.web3.utils.hexToNumber(logs[0].topics[2]).toString();

    const issuer: Issuer = configuration.blockchainProperties.issuer;

    const data = await issuer.encodeData(fromTime, toTime, deviceId);

    let tx: TransactionReceipt;

    if (isVolumePrivate) {
        const ownershipCommitment: IOwnershipCommitment = {
            ownerAddress: to,
            volume: value
        };
        const updatedOwnershipProperties = newEntity.prepareEntityCreation(
            ownershipCommitment,
            OwnershipCommitmentSchema
        );

        await newEntity.syncOffChainStorage(ownershipCommitment, updatedOwnershipProperties);

        tx = await issuer.issuePrivate(
            to,
            updatedOwnershipProperties.rootHash,
            data,
            Configuration.getAccount(configuration)
        );
        newEntity.propertiesDocumentHash = updatedOwnershipProperties.rootHash;
    } else {
        tx = await issuer.issue(to, value, data, Configuration.getAccount(configuration));
    }

    newEntity.id = getIdFromLogs(tx.logs);

    if (configuration.logger) {
        configuration.logger.info(`Certificate ${newEntity.id} created`);
    }

    return newEntity.sync();
};

export async function claimCertificates(
    certificateIds: string[],
    configuration: Configuration.Entity
) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

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
        certificateIdsAsNumber,
        values,
        data,
        claimData,
        Configuration.getAccount(configuration)
    );
}

export async function transferCertificates(
    certificateIds: string[],
    to: string,
    configuration: Configuration.Entity
) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

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
        certificateIdsAsNumber,
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
            return Number(certId) > 0 ? new Entity(certId, configuration).sync() : null;
        });

    const certificates = await Promise.all(certificatePromises);

    return certificates.filter(cert => cert !== null);
}
