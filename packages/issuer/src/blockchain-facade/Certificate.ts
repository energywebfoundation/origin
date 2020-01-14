import { TransactionReceipt, EventLog } from 'web3-core';

import { Configuration, BlockchainDataModelEntity, Timestamp } from '@energyweb/utils-general';

import { Registry, PublicIssuer } from '..';

export interface ICertificate {
    id: string;

    issuer: string;
    
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;

    energy: number;
    creationTime: number;

    sync(): Promise<ICertificate>;

    getCertificateOwner(): Promise<string>;
    isClaimed(): Promise<boolean>;
    claim(amount: number): Promise<TransactionReceipt>;

    transfer(to: string, amount: number): Promise<TransactionReceipt>;

    getAllCertificateEvents(): Promise<EventLog[]>;
}

export const getCertificateListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;

    return parseInt(
        await registry.totalSupply(),
        10
    );
};

const getAccountFromConfiguration = (configuration: Configuration.Entity) => ({
    from: configuration.blockchainProperties.activeUser.address,
    privateKey: configuration.blockchainProperties.activeUser.privateKey
});

export const getAllCertificates = async (configuration: Configuration.Entity) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return Promise.all(certificatePromises);
};

// export const getActiveCertificates = async (configuration: Configuration.Entity) => {
//     const certificatePromises = Array(await getCertificateListLength(configuration))
//         .fill(null)
//         .map((item, index) => new Entity(index.toString(), configuration).sync());

//     const certs = await Promise.all(certificatePromises);

//     return certs.filter((cert: Entity) => Number(cert.status) === Status.Active);
// };

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
            toBlock: undefined
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
                toBlock: undefined
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

    public initialized: boolean;

    private data: number[];

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
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

    async getCertificateOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
            this.id
        );
    }

    async claim(amount: number): Promise<TransactionReceipt> {
        const registry: Registry = this.configuration.blockchainProperties.certificateLogicInstance;
        const owner = this.configuration.blockchainProperties.activeUser.address;

        const { randomHex, hexToBytes } = this.configuration.blockchainProperties.web3.utils;

        const claimData = randomHex(32);

        return registry.safeTransferAndClaimFrom(
            owner,
            owner,
            parseInt(this.id, 10),
            amount,
            this.data,
            hexToBytes(claimData),
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
            Math.round(amount),
            this.data,
            getAccountFromConfiguration(this.configuration)
        );
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        return getAllCertificateEvents(parseInt(this.id, 10), this.configuration);
    }

    async isOwned(): Promise<boolean> {
        const ownedVolume = await this.ownedVolume();

        return ownedVolume > 0;
    }

    async ownedVolume(): Promise<number> {
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

export async function claimCertificates(
    certificateIds: string[],
    configuration: Configuration.Entity
) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    return configuration.blockchainProperties.certificateLogicInstance.claimCertificateBulk(
        certificateIdsAsNumber,
        getAccountFromConfiguration(configuration)
    );
}

export async function requestCertificates(
    deviceId: string,
    limitingSmartMeterReadIndex: number,
    configuration: Configuration.Entity
) {
    return configuration.blockchainProperties.certificateLogicInstance.requestCertificates(
        parseInt(deviceId, 10),
        limitingSmartMeterReadIndex,
        getAccountFromConfiguration(configuration)
    );
}

export async function approveCertificationRequest(
    certicationRequestIndex: number,
    configuration: Configuration.Entity
) {
    return configuration.blockchainProperties.certificateLogicInstance.approveCertificationRequest(
        certicationRequestIndex,
        getAccountFromConfiguration(configuration)
    );
}

export const createCertificate = async (
    to: string,
    validityFunction: string,
    value: number,
    fromTime: Timestamp,
    toTime: Timestamp,
    deviceId: string,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const certificate = new Entity(null, configuration);

    const registry: Registry = configuration.blockchainProperties.certificateLogicInstance;
    const issuer: PublicIssuer = configuration.blockchainProperties.issuerLogicInstance.public;

    const fromAccount = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    const validityData = configuration.blockchainProperties.web3.eth.abi.encodeFunctionCall({
        name: 'isValid',
        type: 'function',
        inputs: [{
            type: 'uint',
            name: '_requestId'
        }]
    }, ['1']);

    const data = await issuer.encodeIssue(fromTime, toTime, deviceId);

    const { logs } = await registry.issue(to, validityData, 123, value, data, fromAccount);

    certificate.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[1].topics[1])
        .toString();

    if (configuration.logger) {
        configuration.logger.info(`Certificate ${certificate.id} created`);
    }

    return certificate.sync();
};