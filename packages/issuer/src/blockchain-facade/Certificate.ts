import { TransactionReceipt, EventLog } from 'web3-core';
import { PreciseProofs } from 'precise-proofs-js';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';

import { Registry, Issuer, OwnershipCommitmentSchema } from '..';
import { TransferSingleEvent } from '../wrappedContracts/Registry';
import { IOwnershipCommitment } from './IOwnershipCommitment';

export interface ICertificateOwners {
    [address: string]: number;
}
export interface ICertificate {
    id: string;
    issuer: string;
    deviceId: string;
    energy: number;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    owners?: ICertificateOwners;
}

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<EventLog[]> => {
    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;

    const allEvents = await registry.getAllEvents(
        {
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
        }
    );

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
        const transferEvents = await registry.getAllTransferSingleEvents(
            {
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
            }
        );

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
    public ownershipCommitment: IOwnershipCommitment;
    public owners: ICertificateOwners = {};
    
    public initialized: boolean = false;
    
    public data: number[];

    constructor(id: string, configuration: Configuration.Entity, public isPrivate: boolean = false) {
        super(id, configuration);
    }

    async sync(): Promise<Entity> {
        if (this.id === null) {
            return this;
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const certOnChain = await registry.getCertificate(Number(this.id));

        this.data = certOnChain.data;

        const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;

        const decodedData = await issuer.decodeData(this.data);
        const allIssuanceEvents = await registry.getAllIssuanceSingleEvents({
            filter: { _id: Number(this.id) }
        });
        const creationBlock = await this.configuration.blockchainProperties.web3.eth.getBlock(allIssuanceEvents[0].blockNumber);

        this.generationStartTime = Number(decodedData['0']);
        this.generationEndTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];
        this.issuer = certOnChain.issuer;
        this.creationTime = Number(creationBlock.timestamp);

        if (this.isPrivate) {
            this.ownershipCommitment = await this.getOffChainProperties();
            this.owners = {
                [this.ownershipCommitment.ownerAddress]: this.ownershipCommitment.volume
            };
        } else {
            this.owners = await this.calculateOwnership();
        }

        this.energy = Object.keys(this.owners).map(owner => this.owners[owner]).reduce((a, b) => a + b, 0);

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
    }

    async claim(amount?: number): Promise<TransactionReceipt> {
        const owner = this.configuration.blockchainProperties.activeUser.address;

        if (this.isPrivate) {
            const ownerBalance = this.ownedVolume();

            if (!ownerBalance || this.owners[owner] === null) {
                throw new Error(`transfer(): ${owner} does not own a share in certificate ${this.id}`);
            }

            if (amount && amount !== ownerBalance) {
                throw new Error(`transfer(): unable to claim amount ${amount} Wh. For private certificate you can only claim the full balance of ${ownerBalance} Wh`)
            }

            const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;

            const { salts } = await this.getOffChainDump();

            const calculatedOffChainStorageProperties = this.prepareEntityCreation(
                this.ownershipCommitment,
                OwnershipCommitmentSchema,
                salts
            );

            const { logs } = await issuer.requestMigrateToPublic(Number(this.id), calculatedOffChainStorageProperties.leafs[1].hash);
            const requestId = this.configuration.blockchainProperties.web3.utils.hexToNumber(logs[0].topics[2]);

            const theProof = PreciseProofs.createProof('ownerAddress', calculatedOffChainStorageProperties.leafs, false);
            const onChainProof = theProof.proofPath.map(p => ({
                left: !!p.left,
                hash: p.left || p.right
            }));

            await issuer.migrateToPublic(requestId, amount, calculatedOffChainStorageProperties.leafs[1].salt, onChainProof);

            this.isPrivate = false;
            amount = ownerBalance;
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;

        const { randomHex, hexToBytes } = this.configuration.blockchainProperties.web3.utils;

        // TO-DO: replace with proper claim data
        const claimData = hexToBytes(randomHex(32));

        return registry.safeTransferAndClaimFrom(
            owner,
            owner,
            parseInt(this.id, 10),
            amount,
            this.data,
            claimData,
            Configuration.getAccount(this.configuration)
        );
    }

    async transfer(to: string, amount?: number): Promise<TransactionReceipt | boolean> {
        const from = this.configuration.blockchainProperties.activeUser.address;

        if (this.isPrivate) {
            const senderBalance = this.ownedVolume();

            if (!senderBalance || this.owners[from] === null) {
                throw new Error(`transfer(): ${from} does not own a share in certificate ${this.id}`);
            }

            if (amount && amount !== senderBalance) {
                throw new Error(`transfer(): unable to send amount ${amount} Wh. For private certificate you can only send the full balance of ${senderBalance} Wh`)
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

            const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;
            const { logs } = await issuer.requestPrivateTransfer(Number(this.id), updatedOwnershipProperties.leafs[1].hash);

            const requestId = this.configuration.blockchainProperties.web3.utils.hexToNumber(logs[0].topics[2]);

            const theProof = PreciseProofs.createProof('ownerAddress', updatedOwnershipProperties.leafs, false);
            const onChainProof = theProof.proofPath.map(p => ({
                left: !!p.left,
                hash: p.left || p.right
            }));
            await issuer.approvePrivateTransfer(requestId, onChainProof, previousCommitment, updatedOwnershipProperties.rootHash);

            this.propertiesDocumentHash = updatedOwnershipProperties.rootHash;
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        
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
        const issuer: Issuer = this.configuration.blockchainProperties.issuerLogicInstance;
        
        return issuer.revokeCertificate(Number(this.id), Configuration.getAccount(this.configuration));
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
        return this.owners[owner] ?? 0;
    }

    async isClaimed(byAddress?: string): Promise<boolean> {
        const claimedVolume = await this.claimedVolume(byAddress);

        return claimedVolume > 0;
    }
    
    async claimedVolume(byAddress?: string): Promise<number> {
        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const activeUserAddress = this.configuration.blockchainProperties.activeUser.address;

        const balance = await registry.claimedBalanceOf(
            byAddress ?? activeUserAddress,
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
        
        return Number(balance);
    }

    private async calculateOwnership(): Promise<ICertificateOwners> {
        if (this.isPrivate) {
            throw new Error('Can only calculate ownership for public certificates');
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;

        let transferSingleEvents: TransferSingleEvent[] = (await registry.getAllTransferSingleEvents({
                filter: { _id: this.id }
            }))
            .filter(e => e.returnValues._id === this.id)
            .map(e => e.returnValues as TransferSingleEvent);

        const transferBatchEvents = (await registry.getAllTransferBatchEvents()).map(e => e.returnValues);

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
                    })
                }
            }
        }

        const owners: ICertificateOwners = {};

        for (const event of transferSingleEvents) {
            const { _from, _to, _value } = event;
            const valueTransferred = Number(_value);

            if (_from !== '0x0000000000000000000000000000000000000000') {
                owners[_from] = owners[_from] - valueTransferred;
            }

            if (owners[_to] === null || owners[_to] === undefined) {
                owners[_to] = 0;
            } 

            owners[_to] += valueTransferred;
        }

        return owners;
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
    const newEntity = new Entity(null, configuration, isVolumePrivate);

    const getIdFromLogs = (logs: any) => configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[2])
        .toString();

    const issuer: Issuer = configuration.blockchainProperties.issuerLogicInstance;

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

        tx = await issuer.issuePrivate(to, updatedOwnershipProperties.rootHash, data, Configuration.getAccount(configuration));
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
    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    const certificatesPromises = certificateIds.map(certId => new Entity(certId, configuration).sync());
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

    return registry.safeBatchTransferAndClaimFrom(
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
    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    const certificatesPromises = certificateIds.map(certId => new Entity(certId, configuration).sync());
    const certificates = await Promise.all(certificatesPromises);

    const valuesPromise = certificates.map(cert => cert.ownedVolume());
    const values = await Promise.all(valuesPromise);

    const { randomHex, hexToBytes } = configuration.blockchainProperties.web3.utils;
    // TO-DO: replace with proper data
    const data = hexToBytes(randomHex(32));

    const { from } = Configuration.getAccount(configuration);

    return registry.safeBatchTransferFrom(
        from,
        to,
        certificateIdsAsNumber,
        values,
        data,
        Configuration.getAccount(configuration)
    );
}