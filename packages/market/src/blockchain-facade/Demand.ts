import polly from 'polly-js';
import { TransactionReceipt } from 'web3-core';
import moment from 'moment';

import {
    BlockchainDataModelEntity,
    Compliance,
    Configuration,
    Currency,
    extendArray,
    TimeFrame,
    Resolution,
    TS,
    TimeSeriesElement
} from '@energyweb/utils-general';

import DemandOffChainPropertiesSchema from '../../schemas/DemandOffChainProperties.schema.json';
import { MarketLogic } from '../wrappedContracts/MarketLogic';

export interface IDemandOffChainProperties {
    timeFrame: TimeFrame;
    maxPricePerMwh: number;
    currency: Currency;
    location?: string[];
    assetType?: string[];
    minCO2Offset?: number;
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
    energyPerTimeFrame: number;
    registryCompliance?: Compliance;
    startTime: number;
    endTime: number;
    procureFromSingleFacility?: boolean;
    vintage?: [number, number];
    automaticMatching: boolean;
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
    fill: (entityId: string) => Promise<TransactionReceipt>;
    fillAgreement: (entityId: string) => Promise<TransactionReceipt>;
    missingEnergyInPeriod: (timeStamp: number) => Promise<TimeSeriesElement>;
    missingEnergyInCurrentPeriod: () => Promise<TimeSeriesElement>;
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

        this.marketLogicInstance = configuration.blockchainProperties.marketLogicInstance;
        this.initialized = false;
    }

    getUrl(): string {
        const marketLogicAddress = this.marketLogicInstance.web3Contract.options.address;

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
            DemandOffChainPropertiesSchema
        );

        const oldOffChainData = await this.getOffChainDump();
        const oldHash = this.propertiesDocumentHash;

        await this.syncOffChainStorage(offChainProperties, updatedOffChainStorageProperties);

        try {
            await this.marketLogicInstance.updateDemand(
                this.id,
                updatedOffChainStorageProperties.rootHash,
                this.getUrl(),
                {
                    from: this.configuration.blockchainProperties.activeUser.address,
                    privateKey: this.configuration.blockchainProperties.activeUser.privateKey
                }
            );
        } catch (e) {
            this.configuration.logger.error(
                `Demand::update: Failed to write to the chain. Reverting off-chain properties...`
            );
            this.syncOffChainStorage(oldOffChainData.properties, {
                rootHash: oldHash,
                salts: oldOffChainData.salts,
                schema: oldOffChainData.schema
            });

            throw e;
        }

        return new Entity(this.id, this.configuration).sync();
    }

    async fill(entityId: string): Promise<TransactionReceipt> {
        return this.marketLogicInstance.fillDemand(this.id, entityId, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        });
    }

    async fillAgreement(entityId: string): Promise<TransactionReceipt> {
        return this.marketLogicInstance.fillAgreement(this.id, entityId, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        });
    }

    async changeStatus(status: DemandStatus) {
        await this.marketLogicInstance.changeDemandStatus(this.id, status, {
            from: this.configuration.blockchainProperties.activeUser.address,
            privateKey: this.configuration.blockchainProperties.activeUser.privateKey
        });

        return new Entity(this.id, this.configuration).sync();
    }

    async missingEnergy(): Promise<TimeSeriesElement[]> {
        return calculateMissingEnergyDemand(this, this.configuration);
    }

    async missingEnergyInPeriod(timeStamp: number): Promise<TimeSeriesElement> {
        const missingEnergy: TimeSeriesElement[] = await calculateMissingEnergyDemand(
            this,
            this.configuration
        );
        const resolution = timeFrameToResolution(this.offChainProperties.timeFrame);

        const currentPeriod = moment
            .unix(timeStamp)
            .startOf(resolution)
            .unix();

        return missingEnergy.find(
            (timeSeriesElement: TimeSeriesElement) => timeSeriesElement.time === currentPeriod
        );
    }

    async missingEnergyInCurrentPeriod(): Promise<TimeSeriesElement> {
        return this.missingEnergyInPeriod(moment().unix());
    }

    async isFulfilled(): Promise<boolean> {
        const missingEnergy: TimeSeriesElement[] = await this.missingEnergy();
        return missingEnergy.every((ts: TimeSeriesElement) => ts.value === 0);
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
        DemandOffChainPropertiesSchema
    );

    await polly()
        .waitAndRetry(10)
        .executeForPromise(async () => {
            demand.id = (await getDemandListLength(configuration)).toString();
            await demand.throwIfExists();
        });

    await demand.syncOffChainStorage(demandPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateDemand,
        logs
    } = await configuration.blockchainProperties.marketLogicInstance.createDemand(
        offChainStorageProperties.rootHash,
        demand.getUrl(),
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    if (!successCreateDemand) {
        await demand.deleteFromOffChainStorage();
        throw new Error('createDemand: Saving on-chain data failed. Reverting...');
    }

    const idFromTx = configuration.blockchainProperties.web3.utils
        .hexToNumber(logs[0].topics[1])
        .toString();

    if (demand.id !== idFromTx) {
        demand.id = idFromTx;
        await demand.syncOffChainStorage(demandPropertiesOffChain, offChainStorageProperties);
    }

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

const timeFrameToResolution = (timeFrame: TimeFrame): Resolution => {
    let resolution: Resolution = 'day';

    switch (timeFrame) {
        case TimeFrame.hourly:
            resolution = 'hour';
            break;
        case TimeFrame.daily:
            resolution = 'day';
            break;
        case TimeFrame.weekly:
            resolution = 'week';
            break;
        case TimeFrame.monthly:
            resolution = 'month';
            break;
        case TimeFrame.yearly:
            resolution = 'year';
            break;
        default:
            break;
    }

    return resolution;
};

const durationInTimePeriod = (start: number, end: number, timeFrame: TimeFrame) => {
    const demandDuration = moment.duration(moment.unix(end).diff(moment.unix(start)));
    let durationInTimeFrame = 0;

    switch (timeFrame) {
        case TimeFrame.daily:
            durationInTimeFrame = Math.ceil(demandDuration.asDays());
            break;
        case TimeFrame.weekly:
            durationInTimeFrame = Math.ceil(demandDuration.asWeeks());
            break;
        case TimeFrame.monthly:
            durationInTimeFrame = Math.ceil(demandDuration.asMonths());
            break;
        case TimeFrame.yearly:
            durationInTimeFrame = Math.ceil(demandDuration.asYears());
            break;
        case TimeFrame.hourly:
            durationInTimeFrame = Math.ceil(demandDuration.asHours());
            break;
        default:
            break;
    }

    return durationInTimeFrame;
};

export const calculateTotalEnergyDemand = (
    startDate: number,
    endDate: number,
    energyPerTimeFrame: number,
    timeFrame: TimeFrame
) => {
    const durationInTimeFrame = durationInTimePeriod(startDate, endDate, timeFrame);

    return energyPerTimeFrame * durationInTimeFrame;
};

export const alignToResolution = (timeStamp: number, resolution: Resolution) =>
    moment
        .unix(timeStamp)
        .startOf(resolution as moment.unitOfTime.StartOf)
        .unix();

export const calculateMissingEnergyDemand = async (
    demand: IDemand,
    config: Configuration.Entity
) => {
    const { startTime, endTime, timeFrame, energyPerTimeFrame } = demand.offChainProperties;

    if (timeFrame === TimeFrame.halfHourly) {
        throw new Error('Half-hourly demands are not supported');
    }

    const durationInTimeFrame = durationInTimePeriod(startTime, endTime, timeFrame);
    const resolution = timeFrameToResolution(timeFrame);
    const demandTimeSeries = TS.generate(
        startTime,
        durationInTimeFrame,
        resolution,
        energyPerTimeFrame
    );

    const marketLogic: MarketLogic = config.blockchainProperties.marketLogicInstance;
    const filledEvents = await marketLogic.getEvents('DemandPartiallyFilled', {
        filter: { _demandId: demand.id }
    });

    const filledDemandsTimeSeries = await Promise.all(
        filledEvents.map(async log => {
            const block = await config.blockchainProperties.web3.eth.getBlock(log.blockNumber);
            const nearestTime = moment
                .unix(parseInt(block.timestamp.toString(), 10))
                .startOf(resolution as moment.unitOfTime.StartOf)
                .unix();

            return { time: nearestTime, value: Number(log.returnValues._amount) * -1 };
        })
    );

    const filledDemandInRange = TS.inRange(
        filledDemandsTimeSeries,
        alignToResolution(startTime, resolution),
        alignToResolution(endTime, resolution)
    );

    return TS.aggregateByTime(demandTimeSeries.concat(filledDemandInRange));
};
