import {
    BlockchainDataModelEntity,
    Compliance,
    Configuration,
    Currency,
    extendArray,
    TimeFrame
} from '@energyweb/utils-general';

import DemandOffChainPropertiesSchema from '../../schemas/DemandOffChainProperties.schema.json';
import { MarketLogic } from '../wrappedContracts/MarketLogic';

export interface IDemandOffChainProperties {
    timeFrame: TimeFrame;
    maxPricePerMwh: number;
    currency: Currency;
    location?: IDemandLocation;
    assetType?: string[];
    minCO2Offset?: number;
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
    targetWhPerPeriod: number;
    registryCompliance?: Compliance;
    startTime: string;
    endTime: string;
    procureFromSingleFacility?: boolean;
    vintage?: [number, number];
}

export interface IDemandLocation {
    provinces?: string[];
    regions?: string[];
}

export enum DemandStatus {
    ACTIVE,
    PAUSED,
    ARCHIVED
}

export interface IDemandOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    demandOwner: string;
    status: DemandStatus;
}

export interface IDemand extends IDemandOnChainProperties {
    id: string;
    offChainProperties: IDemandOffChainProperties;
}

export class Entity extends BlockchainDataModelEntity.Entity implements IDemand {
    offChainProperties: IDemandOffChainProperties;

    propertiesDocumentHash: string;

    url: string;

    status: DemandStatus;

    demandOwner: string;

    initialized: boolean;

    configuration: Configuration.Entity;

    marketLogicInstance: MarketLogic;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.marketLogicInstance = configuration.blockchainProperties.marketLogicInstance!;
        this.initialized = false;
    }

    getUrl(): string {
        const marketLogicAddress = this.marketLogicInstance.web3Contract._address;

        return `${this.configuration.offChainDataSource.baseUrl}/Demand/${marketLogicAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const demand = await this.marketLogicInstance.getDemand(this.id);

            if (demand._owner === '0x0000000000000000000000000000000000000000') {
                return this;
            }

            this.propertiesDocumentHash = demand._propertiesDocumentHash;
            this.url = demand._documentDBURL;
            this.demandOwner = demand._owner;
            this.status = Number(demand._status);
            this.initialized = true;
            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Demand ${this.id} synced`);
            }
        }

        return this;
    }

    async clone(): Promise<Entity> {
        await this.sync();

        return createDemand(this.offChainProperties, this.configuration); // eslint-disable-line @typescript-eslint/no-use-before-define
    }

    async update(offChainProperties: IDemandOffChainProperties) {
        const updatedOffChainStorageProperties = this.prepareEntityCreation(
            offChainProperties,
            DemandOffChainPropertiesSchema,
            this.getUrl()
        );

        await this.marketLogicInstance.updateDemand(
            this.id,
            updatedOffChainStorageProperties.rootHash,
            this.getUrl(),
            {
                from: this.configuration.blockchainProperties.activeUser.address,
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            }
        );

        await this.putToOffChainStorage(offChainProperties, updatedOffChainStorageProperties);

        return new Entity(this.id, this.configuration).sync();
    }

    async changeStatus(status: DemandStatus) {
        await this.marketLogicInstance.changeDemandStatus(this.id, status, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        });

        return new Entity(this.id, this.configuration).sync();
    }
}

export const getAllDemandsListLength = async (configuration: Configuration.Entity) => {
    return parseInt(
        await configuration.blockchainProperties.marketLogicInstance.getAllDemandListLength(),
        10
    );
};

export const getAllDemands = async (configuration: Configuration.Entity) => {
    const demandsPromises = Array(await getAllDemandsListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index.toString(), configuration).sync());

    return (await Promise.all(demandsPromises)).filter(promise => promise.initialized);
};

export const filterDemandBy = async (
    configuration: Configuration.Entity,
    onChainProperties: Partial<IDemandOnChainProperties>
) => {
    const allDemands = await getAllDemands(configuration);
    const filter = { ...onChainProperties } as Partial<Entity>;

    return extendArray(allDemands).filterBy(filter);
};

export const getDemandListLength = async (configuration: Configuration.Entity): Promise<number> => {
    return configuration.blockchainProperties.marketLogicInstance.getAllDemandListLength();
};

export const createDemand = async (
    demandPropertiesOffChain: IDemandOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const demand = new Entity(null, configuration);

    const offChainStorageProperties = demand.prepareEntityCreation(
        demandPropertiesOffChain,
        DemandOffChainPropertiesSchema,
        demand.getUrl()
    );

    const tx = await configuration.blockchainProperties.marketLogicInstance.createDemand(
        offChainStorageProperties.rootHash,
        demand.getUrl(),
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    demand.id = configuration.blockchainProperties.web3.utils
        .hexToNumber(tx.logs[0].topics[1])
        .toString();

    await demand.putToOffChainStorage(demandPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demand.id} created`);
    }

    return demand.sync();
};

export const deleteDemand = async (
    demandId: string,
    configuration: Configuration.Entity
): Promise<boolean> => {
    let success = true;

    try {
        await configuration.blockchainProperties.marketLogicInstance.deleteDemand(demandId, {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        });
    } catch (e) {
        success = false;
        throw e;
    }

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demandId} deleted`);
    }

    return success;
};
