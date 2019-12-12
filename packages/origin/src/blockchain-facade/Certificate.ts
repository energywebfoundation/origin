import { TransactionReceipt, EventLog } from 'web3-core';

import { Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';
import { ProducingDevice } from '@energyweb/device-registry';

import { CertificateLogic } from '..';

export enum Status {
    Active,
    Claimed,
    Split
}

export interface ICertificate {
    id: string;

    deviceId: number;
    generationStartTime: number;
    generationEndTime: number;

    owner: string;
    energy: number;
    status: Status;
    creationTime: number;
    parentId: number;
    children: string[];

    sync(): Promise<ICertificate>;

    claimCertificate(): Promise<TransactionReceipt>;
    splitCertificate(energy: number): Promise<TransactionReceipt>;
    getCertificateOwner(): Promise<string>;
    isClaimed(): Promise<boolean>;
    claim(): Promise<TransactionReceipt>;

    approve(_approved: string): Promise<TransactionReceipt>;
    getApproved(): Promise<string>;
    transferFrom(_to: string): Promise<TransactionReceipt>;
    safeTransferFrom(_to: string, _calldata?: string): Promise<TransactionReceipt>;

    getCertificationRequestEvents(): any;
    getAllCertificateEvents(): Promise<EventLog[]>;
}

export const getCertificateListLength = async (
    configuration: Configuration.Entity
): Promise<number> => {
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
            if (fullEvent.returnValues.tokenId === `${certId}`) {
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
    public deviceId: number;

    public generationStartTime: number;
    public generationEndTime: number;
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

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const { certificateLogicInstance } = this.configuration.blockchainProperties;

            const cert = await certificateLogicInstance.getCertificate(Number(this.id));

            this.deviceId = Number(cert.deviceId);
            this.owner = await this.configuration.blockchainProperties.certificateLogicInstance.ownerOf(
                this.id
            );
            this.energy = Number(cert.energy);

            this.children = cert.children;
            this.status = Number(cert.status);
            this.creationTime = Number(cert.creationTime);
            this.parentId = Number(cert.parentId);

            const reads = await new ProducingDevice.Entity(
                this.deviceId.toString(),
                this.configuration
            ).getSmartMeterReadsByIndex([Number(cert.readsStartIndex), Number(cert.readsEndIndex)]);
            this.generationStartTime = reads[0].timestamp;
            this.generationEndTime = reads[1].timestamp;

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Certificate ${this.id} synced`);
            }
        }

        return this;
    }

    async claimCertificate(): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.claimCertificate(
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.claimCertificate(
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
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

    async getCertificateOwner(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getCertificateOwner(
            this.id
        );
    }

    async isClaimed(): Promise<boolean> {
        return this.configuration.blockchainProperties.certificateLogicInstance.isClaimed(this.id);
    }

    async claim(): Promise<TransactionReceipt> {
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
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.approve(
            _approved,
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async getApproved(): Promise<string> {
        return this.configuration.blockchainProperties.certificateLogicInstance.getApproved(
            this.id
        );
    }

    async getCertificationRequestEvents() {
        const {
            certificateLogicInstance
        }: {
            certificateLogicInstance?: CertificateLogic;
        } = this.configuration.blockchainProperties;

        const logCreatedEvents = await certificateLogicInstance.getAllLogCreatedCertificateEvents({
            filter: {
                _certificateId: this.id
            },
            fromBlock: 0
        });

        const logCreatedEvent = logCreatedEvents[0];

        if (!logCreatedEvent) {
            return null;
        }

        const certificationRequestsApprovedEvents = await certificateLogicInstance.getAllCertificationApprovedEvents(
            {
                filter: {
                    deviceId: this.deviceId
                },
                fromBlock: logCreatedEvent.blockNumber,
                toBlock: logCreatedEvent.blockNumber
            }
        );

        if (
            !certificationRequestsApprovedEvents ||
            certificationRequestsApprovedEvents.length === 0
        ) {
            return null;
        }

        const allReads = await (
            await new ProducingDevice.Entity(this.deviceId.toString(), this.configuration).sync()
        ).getSmartMeterReads();

        const approvedCertificationRequestEvent = certificationRequestsApprovedEvents.filter(
            request => {
                return (
                    allReads
                        .slice(
                            request.returnValues.readsStartIndex,
                            parseInt(request.returnValues.readsEndIndex, 10) + 1
                        )
                        .reduce((a, b) => a + b.energy, 0) === this.energy
                );
            }
        )[0];

        const certificationRequestsCreatedEvents = await certificateLogicInstance.getAllCertificationCreatedEvents(
            {
                filter: {
                    readsStartIndex: approvedCertificationRequestEvent.returnValues.readsStartIndex,
                    readsEndIndex: approvedCertificationRequestEvent.returnValues.readsEndIndex,
                    deviceId: this.deviceId
                },
                fromBlock: 0
            }
        );

        if (
            !certificationRequestsCreatedEvents ||
            certificationRequestsCreatedEvents.length === 0
        ) {
            return null;
        }

        return {
            approvedCertificationRequestEvent,
            certificationRequestCreatedEvent: certificationRequestsCreatedEvents[0]
        };
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
                if (fullEvent.returnValues.tokenId === `${this.id}`) {
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
                _calldata || null,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.safeTransferFrom(
            this.owner,
            _to,
            this.id,
            _calldata || null,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
    }

    async transferFrom(_to: string): Promise<TransactionReceipt> {
        if (this.configuration.blockchainProperties.activeUser.privateKey) {
            return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
                this.owner,
                _to,
                this.id,
                { privateKey: this.configuration.blockchainProperties.activeUser.privateKey }
            );
        }
        return this.configuration.blockchainProperties.certificateLogicInstance.transferFrom(
            this.owner,
            _to,
            this.id,
            { from: this.configuration.blockchainProperties.activeUser.address }
        );
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
