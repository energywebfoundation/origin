import { TransactionReceipt, EventLog } from 'web3/types';

import { Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';

export enum Status {
    Active,
    Claimed,
    Split
}

export interface ICertificate {
    id: string;

    assetId: number;
    owner: string;
    energy: number;
    status: Status;
    creationTime: number;
    parentId: number;
    children: string[];

    splitCertificate(energy: number): Promise<TransactionReceipt>;
    transferFrom(_to: string): Promise<TransactionReceipt>;
}

export const getCertificateListLength = async (configuration: Configuration.Entity): Promise<number> => {
    return parseInt(
        await configuration.blockchainProperties.certificateLogicInstance.getCertificateListLength(),
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

export const getActiveCertificates = async (configuration: Configuration.Entity) => {
    const certificatePromises = Array(await getCertificateListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    const certs = await Promise.all(certificatePromises);

    return certs.filter((cert: Entity) => Number(cert.status) === Status.Active);
};

export const getAllCertificateEvents = async (
    certId: number,
    configuration: Configuration.Entity
): Promise<EventLog[]> => {
    const allEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
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
            if (fullEvent.returnValues._tokenId === `${certId}`) {
                returnEvents.push(fullEvent);
            }
        } else {
            returnEvents.push(fullEvent);
        }
    }

    // we also have to search
    if (certId !== 0) {
        const transferEvents = await configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
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
    public assetId: number;
    public owner: string;
    public energy: number;
    public status: Status;
    public creationTime: number;
    public parentId: number;
    public children: string[];

    public initialized: boolean;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        const certificateLogicAddress = this.configuration.blockchainProperties.certificateLogicInstance.web3Contract.options.address;

        return `${this.configuration.offChainDataSource.baseUrl}/Certificate/${certificateLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const cert = await this.configuration.blockchainProperties.certificateLogicInstance.getCertificate(
                this.id
            );

            this.assetId = cert.assetId;
            this.owner = await this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(this.id);
            this.energy = Number(cert.energy);
            this.children = cert.children;
            this.status = cert.status;
            this.creationTime = cert.creationTime;
            this.parentId = cert.parentId;

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Certificate ${this.id} synced`);
            }
        }

        return this;
    }

    async splitCertificate(energy: number): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
                this.id,
                energy,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.splitCertificate(
            this.id,
            energy,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async isClaimed(): Promise<boolean> {
        return Number(this.status) === Status.Claimed;
    }

    async claim() {
        const accountProperties = {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        };

        return this.configuration.blockchainProperties.certificateLogicInstance.claimCertificate(
            parseInt(this.id, 10),
            accountProperties
        );
    }

    async approve(_approved: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.approve(
                _approved,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async getApproved(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getApproved(this.id);
    }

    async getAllCertificateEvents(): Promise<EventLog[]> {
        const allEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllEvents(
            {
                topics: [
                    null,
                    this.configuration.blockchainProperties.web3.utils.padLeft(
                        this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
                        64,
                        '0'
                    )
                ],
                fromBlock: 0
            }
        );

        const returnEvents = [];

        for (const fullEvent of allEvents) {
            // we have to remove some false positives due to ERC721 interface
            if (fullEvent.event === 'Transfer') {
                if (fullEvent.returnValues._tokenId === `${this.id}`) {
                    returnEvents.push(fullEvent);
                }
            } else {
                returnEvents.push(fullEvent);
            }
        }

        // we also have to search
        if (this.id !== '0') {
            const transferEvents = await this.configuration.blockchainProperties.certificateLogicInstance.getAllTransferEvents(
                {
                    topics: [
                        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                        null,
                        null,
                        this.configuration.blockchainProperties.web3.utils.padLeft(
                            this.configuration.blockchainProperties.web3.utils.fromDecimal(this.id),
                            64,
                            '0'
                        )
                    ],
                    fromBlock: 0
                }
            );

            for (const transferEvent of transferEvents) {
                returnEvents.push(transferEvent);
            }
        }

        return returnEvents;
    }

    async safeTransferFrom(_to: string, _calldata?: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
                this.owner,
                _to,
                this.id,
                _calldata ? _calldata : null,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }

    async transferFrom(_to: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        } else {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { from: this.configuration.blockchainProperties.activeUser.address }
            );
        }
    }
}

export async function claimCertificates(certificateIds: string[], configuration: Configuration.Entity) {
    const certificateIdsAsNumber = certificateIds.map(c => parseInt(c, 10));

    return configuration.blockchainProperties.certificateLogicInstance.claimCertificateBulk(
        certificateIdsAsNumber,
        getAccountFromConfiguration(configuration)
    );
}

export async function requestCertificates(
    assetId: string,
    limitingSmartMeterReadIndex: number,
    configuration: Configuration.Entity
) {
    return configuration.blockchainProperties.certificateLogicInstance.requestCertificates(
        parseInt(assetId, 10),
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
