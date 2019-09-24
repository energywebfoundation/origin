import {
    BlockchainDataModelEntity,
    Compliance,
    Configuration,
    Currency,
    extendArray,
    TimeFrame
} from '@energyweb/utils-general';
// eslint-disable-next-line import/no-unresolved
import { TransactionReceipt } from 'web3/types';

import moment from 'moment';
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
    startTime: string;
    endTime: string;
    procureFromSingleFacility?: boolean;
    vintage?: [number, number];
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

    async fill(entityId: string): Promise<TransactionReceipt> {
        return this.marketLogicInstance.fillDemand(this.id, entityId, {
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

const durationInTimePeriod = (
    start: number | moment.Moment,
    end: number | moment.Moment,
    timeFrame: TimeFrame
) => {
    const demandDuration = moment.duration(moment(end).diff(moment(start)));
    let durationInTimeFrame = 0;
    let unit = '';

    switch (timeFrame) {
        case TimeFrame.daily:
            durationInTimeFrame = Math.ceil(demandDuration.asDays());
            unit = 'day';
            break;
        case TimeFrame.weekly:
            durationInTimeFrame = Math.ceil(demandDuration.asWeeks());
            unit = 'week';
            break;
        case TimeFrame.monthly:
            durationInTimeFrame = Math.ceil(demandDuration.asMonths());
            unit = 'month';
            break;
        case TimeFrame.yearly:
            durationInTimeFrame = Math.ceil(demandDuration.asYears());
            unit = 'year';
            break;
        default:
            break;
    }

    return { durationInTimeFrame, unit };
};

export const calculateTotalEnergyDemand = (
    startDate: number | moment.Moment,
    endDate: number | moment.Moment,
    energyPerTimeFrame: number,
    timeFrame: TimeFrame
) => {
    const { durationInTimeFrame } = durationInTimePeriod(startDate, endDate, timeFrame);

    return energyPerTimeFrame * durationInTimeFrame;
};

const generateTimeSeries = (
    start: moment.Moment,
    length: number,
    resolution: string,
    value: number
) =>
    [...Array(length).keys()].map(i => ({
        time: start.clone().add(Number(i), resolution as moment.unitOfTime.DurationConstructor),
        value
    }));

type TimeSeriesElement = { time: moment.Moment; value: number };

const aggregateByDate = (timeSeries: TimeSeriesElement[]) =>
    timeSeries
        .reduce((dict, current) => {
            const key = current.time.unix();
            const value = dict.has(key) ? dict.get(key).value + current.value : current.value;

            return dict.set(key, { ...current, value });
        }, new Map<number, TimeSeriesElement>())
        .values();

export const calculateMissingEnergyDemand = async (
    demand: IDemand,
    config: Configuration.Entity
) => {
    const { startTime, endTime, timeFrame, energyPerTimeFrame } = demand.offChainProperties;

    if (timeFrame === TimeFrame.hourly || timeFrame === TimeFrame.halfHourly) {
        throw new Error('Hourly and half-hourly demands are not supported');
    }

    const start = moment(startTime);
    const end = moment(endTime);
    const { durationInTimeFrame, unit } = durationInTimePeriod(start, end, timeFrame);
    const demandTimeSeries = generateTimeSeries(
        start,
        durationInTimeFrame,
        unit,
        energyPerTimeFrame
    );

    const marketLogic: MarketLogic = config.blockchainProperties.marketLogicInstance;
    const filledEvents = await marketLogic.getEvents('DemandPartiallyFilled', {
        filter: { _demandId: demand.id }
    });

    const emptyFilledTimeSeries = generateTimeSeries(start, durationInTimeFrame, unit, 0);
    const filledTimeSeries = await Promise.all(
        filledEvents.map(async log => {
            const block = await config.blockchainProperties.web3.eth.getBlock(log.blockNumber);
            const nearestTime = moment
                .unix(block.timestamp)
                .startOf(unit as moment.unitOfTime.StartOf);

            return { time: nearestTime, value: Number(log.returnValues._amount) * -1 };
        })
    );

    const aggregated = Array.from(aggregateByDate(emptyFilledTimeSeries.concat(filledTimeSeries)));

    return demandTimeSeries.map((item, index) => ({
        ...item,
        value: item.value + aggregated[index].value
    }));
};
