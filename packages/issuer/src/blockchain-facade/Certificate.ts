import { TransactionReceipt, EventLog } from 'web3-core';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';

import { Registry, PublicIssuer, PrivateIssuer, CertificateTopic, ICommitment, CommitmentSchema } from '..';

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

    isOwned(byAddress?: string): Promise<boolean>;
    ownedVolume(byAddress?: string): Promise<number>;
    isClaimed(byAddress?: string): Promise<boolean>;
    claimedVolume(byAddress?: string): Promise<number>;
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
            Configuration.getAccount(this.configuration)
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
            Configuration.getAccount(this.configuration)
        );
    }

    async revoke(): Promise<TransactionReceipt> {
        const publicIssuer: PublicIssuer = this.configuration.blockchainProperties.issuerLogicInstance.public;
        
        return publicIssuer.revokeCertificate(Number(this.id), Configuration.getAccount(this.configuration));
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return getAllCertificateEvents(parseInt(this.id, 10), this.configuration);
    }

    async isOwned(byAddress?: string): Promise<boolean> {
        if (this.isPrivate) {
            throw new Error('Unable to fetch owner for private certificates.');
        }

        const ownedVolume = await this.ownedVolume(byAddress);

        return ownedVolume > 0;
    }

    async ownedVolume(byAddress?: string): Promise<number> {
        if (this.isPrivate) {
            throw new Error('Unable to fetch volumes for private certificates.');
        }

        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const activeUserAddress = this.configuration.blockchainProperties.activeUser.address;

        const balance = await registry.balanceOf(
            byAddress ?? activeUserAddress,
            Number(this.id),
            Configuration.getAccount(this.configuration)
        );
        
        return Number(balance);
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
        .hexToNumber(logs[0].topics[2])
        .toString();

    if (isVolumePrivate) {
        const privateIssuer: PrivateIssuer = configuration.blockchainProperties.issuerLogicInstance.private;
        const data = await privateIssuer.encodeIssue(fromTime, toTime, deviceId);

        const { logs } = await registry.issue(to, [], CertificateTopic.PRIVATE_IREC, value, data, Configuration.getAccount(configuration));

        certificate.id = getIdFromLogs(logs);

        const commitment: ICommitment = { volume: value };
        const { rootHash } = certificate.prepareEntityCreation(commitment, CommitmentSchema);
        await privateIssuer.updateCommitment(Number(certificate.id), configuration.blockchainProperties.web3.utils.hexToBytes('0x0'), rootHash);
    } else {
        const publicIssuer: PublicIssuer = configuration.blockchainProperties.issuerLogicInstance.public
        const data = await publicIssuer.encodeIssue(fromTime, toTime, deviceId);

        const { logs } = await publicIssuer.issue(CertificateTopic.PUBLIC_IREC, to, value, data, Configuration.getAccount(configuration));

        certificate.id = getIdFromLogs(logs);
    }
    
    if (configuration.logger) {
        configuration.logger.info(`Certificate ${certificate.id} created`);
    }

    return certificate.sync();
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