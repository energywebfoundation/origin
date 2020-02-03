import moment from 'moment';
import {
    DemandPostData,
    DemandUpdateData,
    DemandStatus,
    IDemand,
    CreatedNewDemand,
    IEvent,
    SupportedEvents,
    DemandUpdated,
    DemandPartiallyFilledEvent
} from '@energyweb/origin-backend-core';

import { IDemandClient, IEventClient } from '@energyweb/origin-backend-client';

export class DemandClientMock implements IDemandClient {
    private storage = new Map<number, IDemand>();

    private idCounter = 0;

    constructor(public eventClient: IEventClient) {}

    async getById(id: number): Promise<IDemand> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IDemand[]> {
        return [...this.storage.values()];
    }

    async add(data: DemandPostData): Promise<IDemand> {
        this.idCounter++;

        const demand: IDemand = {
            ...data,
            id: this.idCounter,
            status: DemandStatus.ACTIVE,
            demandPartiallyFilledEvents: []
        };

        const eventData: CreatedNewDemand = {
            demandId: demand.id
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.CREATE_NEW_DEMAND,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        this.storage.set(demand.id, demand);

        return demand;
    }

    update(id: number, data: DemandUpdateData): Promise<IDemand> {
        const demand: IDemand = this.storage.get(id);

        if (demand.status !== data.status) {
            demand.status = data.status;
        }

        const hasNewFillEvent = data.demandPartiallyFilledEvent !== null;

        if (hasNewFillEvent) {
            demand.demandPartiallyFilledEvents.push(data.demandPartiallyFilledEvent);
        }

        this.storage.set(id, demand);

        const eventData: DemandUpdated = {
            demandId: demand.id
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.DEMAND_UPDATED,
            data: eventData,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        if (hasNewFillEvent) {
            const eventData: DemandPartiallyFilledEvent = {
                demandId: demand.id,
                ...data.demandPartiallyFilledEvent
            };

            const sendEvent: IEvent = {
                type: SupportedEvents.DEMAND_PARTIALLY_FILLED,
                data: eventData,
                timestamp: moment().unix()
            };

            (this.eventClient as any).triggerEvent(sendEvent);
        }

        return Promise.resolve(demand);
    }

    delete(id: number): Promise<IDemand> {
        throw new Error('Method not implemented.');
    }
}
