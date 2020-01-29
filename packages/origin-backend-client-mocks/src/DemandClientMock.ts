import {
    DemandPostData,
    DemandUpdateData,
    DemandStatus,
    IDemand
} from '@energyweb/origin-backend-core';

import { IDemandClient } from '@energyweb/origin-backend-client';

export class DemandClientMock implements IDemandClient {
    private storage = new Map<number, IDemand>();

    private idCounter = 0;

    async getById(id: number): Promise<IDemand> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IDemand[]> {
        return [...this.storage.values()];
    }

    async add(data: DemandPostData): Promise<IDemand> {
        this.idCounter++;

        const demand: IDemand = {
            id: this.idCounter,
            status: DemandStatus.ACTIVE,
            demandPartiallyFilledEvents: [],
            ...data
        };

        this.storage.set(demand.id, demand);

        return demand;
    }

    update(id: number, data: DemandUpdateData): Promise<IDemand> {
        const demand: IDemand = this.storage.get(id);

        Object.assign(demand, data);

        this.storage.set(id, demand);

        return Promise.resolve(demand);
    }

    delete(id: number): Promise<IDemand> {
        throw new Error('Method not implemented.');
    }
}
