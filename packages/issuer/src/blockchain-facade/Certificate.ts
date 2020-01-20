import { TransactionReceipt, EventLog } from 'web3-core';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';

import { Registry, PublicIssuer, PrivateIssuer, PRIVATE_CERTIFICATE_TOPIC, PUBLIC_CERTIFICATE_TOPIC, ICommitment, CommitmentSchema } from '..';

export interface ICertificate {
    id: string;

    issuer: string;
    
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;

    energy: number;
    creationTime: number;

    sync(): Promise<ICertificate>;

    isClaimed(): Promise<boolean>;
    claim(amount: number): Promise<TransactionReceipt>;

    transfer(to: string, amount: number): Promise<TransactionReceipt>;

    getAllCertificateEvents(): Promise<EventLog[]>;
}

const getAccountFromConfiguration = (configuration: Configuration.Entity) => ({
    from: configuration.blockchainProperties.activeUser.address,
    privateKey: configuration.blockchainProperties.activeUser.privateKey
});

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

    public generationStartTime: number;
    public generationEndTime: number;
    public issuer: string;
    public energy: number;
    public creationTime: number;

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
        const publicIssuer: PublicIssuer = this.configuration.blockchainProperties.issuerLogicInstance.public;

        const cert = await registry.getCertificate(Number(this.id));

        this.data = cert.data;

        const decodedData = await publicIssuer.decodeIssue(this.data);

        this.generationStartTime = Number(decodedData['0']);
        this.generationEndTime = Number(decodedData['1']);
        this.deviceId = decodedData['2'];

        this.issuer = cert.issuer;

        const allIssuanceEvents = await registry.getAllIssuanceSingleEvents({
            filter: { _id: Number(this.id) }
        });
        const creationBlock = await this.configuration.blockchainProperties.web3.eth.getBlock(allIssuanceEvents[0].blockNumber);

        this.creationTime = Number(creationBlock.timestamp);

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Certificate ${this.id} synced`);
        }

        return this;
    }

    async claim(amount: number): Promise<TransactionReceipt> {
        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const owner = this.configuration.blockchainProperties.activeUser.address;

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
            getAccountFromConfiguration(this.configuration)
        );
    }

    async transfer(to: string, amount: number): Promise<TransactionReceipt> {
        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const from = this.configuration.blockchainProperties.activeUser.address;
        
        return registry.safeTransferFrom(
            from,
            to,
            parseInt(this.id, 10),
            amount,
            this.data,
            getAccountFromConfiguration(this.configuration)
        );
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return getAllCertificateEvents(parseInt(this.id, 10), this.configuration);
    }

    async isOwned(): Promise<boolean> {
        if (this.isPrivate) {
            throw new Error('Unable to fetch owner for private certificates.');
        }

        const ownedVolume = await this.ownedVolume();

        return ownedVolume > 0;
    }

    async ownedVolume(): Promise<number> {
        if (this.isPrivate) {
            throw new Error('Unable to fetch volumes for private certificates.');
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const address = this.configuration.blockchainProperties.activeUser.address;

        const balance = await registry.balanceOf(
            address,
            Number(this.id),
            getAccountFromConfiguration(this.configuration)
        );
        
        return Number(balance);
    }

    async isClaimed(): Promise<boolean> {
        const claimedVolume = await this.claimedVolume();

        return claimedVolume > 0;
    }
    
    async claimedVolume(): Promise<number> {
        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const address = this.configuration.blockchainProperties.activeUser.address;

        const balance = await registry.claimedBalanceOf(
            address,
            Number(this.id),
            getAccountFromConfiguration(this.configuration)
        );
        
        return Number(balance);
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
    const certificate = new Entity(null, configuration, isVolumePrivate);

    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;

    const getIdFromLogs = (logs: any) => configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[1].topics[1])
        .toString();

    if (isVolumePrivate) {
        const privateIssuer: PrivateIssuer = configuration.blockchainProperties.issuerLogicInstance.private;
        const data = await privateIssuer.encodeIssue(fromTime, toTime, deviceId);

        const { logs } = await registry.issue(to, [], PRIVATE_CERTIFICATE_TOPIC, value, data, getAccountFromConfiguration(configuration));

        certificate.id = getIdFromLogs(logs);

        const commitment: ICommitment = { volume: value };
        const { rootHash } = certificate.prepareEntityCreation(commitment, CommitmentSchema);
        await privateIssuer.updateCommitment(Number(certificate.id), configuration.blockchainProperties.web3.utils.hexToBytes('0x0'), rootHash);
    } else {
        const publicIssuer: PublicIssuer = configuration.blockchainProperties.issuerLogicInstance.public
        const data = await publicIssuer.encodeIssue(fromTime, toTime, deviceId);

        const { logs } = await registry.issue(to, [], PUBLIC_CERTIFICATE_TOPIC, value, data, getAccountFromConfiguration(configuration));

        certificate.id = getIdFromLogs(logs);
    }
    
    if (configuration.logger) {
        configuration.logger.info(`Certificate ${certificate.id} created`);
    }

    return certificate.sync();
};

export async function claimCertificates(
    certificateIds: string[],
    from: string,
    to: string,
    configuration: Configuration.Entity
) {
    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    const certificatesPromises = certificateIds.map(certId => new Entity(certId, configuration).sync());
    const certificates = await Promise.all(certificatesPromises);

    const valuesPromise = certificates.map(cert => cert.ownedVolume());
    const values = await Promise.all(valuesPromise);

    const data = certificates.map(cert => cert.data);

    const { randomHex, hexToBytes } = configuration.blockchainProperties.web3.utils;
    // TO-DO: replace with proper claim data
    const claimData = certificates.map(cert => hexToBytes(randomHex(32)));

    return registry.safeBatchTransferAndClaimFrom(
        from,
        to,
        certificateIdsAsNumber,
        values,
        data,
        claimData,
        getAccountFromConfiguration(configuration)
    );
}