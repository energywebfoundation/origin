import {
    Configuration,
    extendArray,
    Resolution,
    TimeFrame,
    TimeSeriesElement,
    TS
} from '@energyweb/utils-general';
import moment from 'moment';

import {
    IDemand,
    DemandStatus,
    DemandPostData,
    DemandUpdateData,
    DemandPartiallyFilled
} from '@energyweb/origin-backend-core';
import { TransactionReceipt } from 'web3-core';

export interface IDemandEntity extends IDemand {
    fillAt: (entityId: string, energy: number) => Promise<TransactionReceipt>;
    missingEnergyInPeriod: (timeStamp: number) => Promise<TimeSeriesElement>;
    missingEnergyInCurrentPeriod: () => Promise<TimeSeriesElement>;
}

export class Entity implements IDemandEntity {
    status: DemandStatus;

    owner: string;

    currency: string;

    timeFrame: number;

    location: string[];

    deviceType: string[];

    maxPriceInCentsPerMwh: number;

    energyPerTimeFrame: number;

    startTime: number;

    endTime: number;

    automaticMatching: boolean;

    procureFromSingleFacility: boolean;

    vintage: [number, number];

    demandPartiallyFilledEvents: string[] = [];

    initialized: boolean;

    constructor(public id: number, public configuration: Configuration.Entity) {
        this.initialized = false;
    }

    async sync(): Promise<Entity> {
        if (this.id != null) {
            const demand = await this.configuration.offChainDataSource.demandClient.getById(
                Number(this.id)
            );

            if (!demand || demand.owner === '0x0000000000000000000000000000000000000000') {
                return this;
            }

            Object.assign(this, demand);

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Demand ${this.id} synced`);
            }
        }

        return this;
    }

    async clone(): Promise<Entity> {
        await this.sync();

        return createDemand(
            {
                owner: this.owner,
                currency: this.currency,
                timeFrame: this.timeFrame,
                maxPriceInCentsPerMwh: this.maxPriceInCentsPerMwh,
                energyPerTimeFrame: this.energyPerTimeFrame,
                startTime: this.startTime,
                endTime: this.endTime,
                automaticMatching: this.automaticMatching,
                location: this.location,
                deviceType: this.deviceType,
                procureFromSingleFacility: this.procureFromSingleFacility,
                vintage: this.vintage
            },
            this.configuration
        ); // eslint-disable-line @typescript-eslint/no-use-before-define
    }

    async update(offChainProperties: DemandUpdateData): Promise<IDemandEntity> {
        await this.configuration.offChainDataSource.demandClient.update(
            this.id,
            offChainProperties
        );

        return this.sync();
    }

    async fillAt(certificateId: string, energy: number): Promise<TransactionReceipt> {
        const tx = await this.configuration.blockchainProperties.marketLogicInstance.splitAndBuyCertificateFor(
            Number(certificateId),
            energy,
            this.owner,
            Configuration.getAccount(this.configuration)
        );

        if (!tx.status) {
            throw new Error('Failed to fill demand.');
        }

        const event: DemandPartiallyFilled = {
            certificateId,
            energy
        };

        await this.update({ demandPartiallyFilledEvent: event });

        return tx;
    }

    async missingEnergy(): Promise<TimeSeriesElement[]> {
        return calculateMissingEnergyDemand(this, this.configuration);
    }

    async missingEnergyInPeriod(timeStamp: number): Promise<TimeSeriesElement> {
        const missingEnergy: TimeSeriesElement[] = await calculateMissingEnergyDemand(
            this,
            this.configuration
        );
        const resolution = timeFrameToResolution(this.timeFrame);

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

export const getDemandListLength = async (configuration: Configuration.Entity): Promise<number> => {
    return (await configuration.offChainDataSource.demandClient.getAll()).length;
};

export const getAllDemands = async (configuration: Configuration.Entity) => {
    const demandsPromises = Array(await getDemandListLength(configuration))
        .fill(null)
        .map((item, index) => new Entity(index + 1, configuration).sync());

    return (await Promise.all(demandsPromises)).filter(promise => promise.initialized);
};

export const filterDemandBy = async (
    configuration: Configuration.Entity,
    onChainProperties: Partial<IDemand>
) => {
    const allDemands = await getAllDemands(configuration);
    const filter = { ...onChainProperties } as Partial<Entity>;

    return extendArray(allDemands).filterBy(filter);
};

export const createDemand = async (
    demandPropertiesOffChain: DemandPostData,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const demand = new Entity(null, configuration);

    const newDemand = await configuration.offChainDataSource.demandClient.add(
        demandPropertiesOffChain
    );

    demand.id = newDemand.id;

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demand.id} created`);
    }

    return demand.sync();
};

export const deleteDemand = async (
    demandId: number,
    configuration: Configuration.Entity
): Promise<boolean> => {
    await configuration.offChainDataSource.demandClient.delete(demandId);

    if (configuration.logger) {
        configuration.logger.info(`Demand ${demandId} deleted`);
    }

    return true;
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

export const alignToResolution = (timestamp: number, resolution: Resolution) =>
    moment
        .unix(timestamp)
        .startOf(resolution as moment.unitOfTime.StartOf)
        .unix();

export const calculateMissingEnergyDemand = async (
    demand: IDemandEntity,
    config: Configuration.Entity
) => {
    const { startTime, endTime, timeFrame, energyPerTimeFrame } = demand;

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

    const filledEvents = demand.demandPartiallyFilledEvents.map(event => JSON.parse(event));

    config.logger.debug(
        `[Demand #${demand.id}] filledEvents ${JSON.stringify(
            filledEvents.map(e => ({
                block: e.blockNumber,
                value: e.energy
            }))
        )}`
    );

    const filledDemandsTimeSeries = await Promise.all(
        filledEvents.map(async log => {
            const block = await config.blockchainProperties.web3.eth.getBlock(log.blockNumber);
            const timestamp = parseInt(block.timestamp.toString(), 10);
            const nearestTime = alignToResolution(timestamp, resolution);

            return { time: nearestTime, value: Number(log.energy) * -1 };
        })
    );

    const filledDemandInRange = TS.inRange(
        filledDemandsTimeSeries,
        alignToResolution(startTime, resolution),
        alignToResolution(endTime, resolution)
    );

    return TS.aggregateByTime(demandTimeSeries.concat(filledDemandInRange));
};
