import { IDevice } from '@energyweb/origin-backend-core';

import { IDeviceClient } from '@energyweb/origin-backend-client';

export class DeviceClientMock implements IDeviceClient {
    private storage = new Map<number, IDevice>();

    async getById(id: number): Promise<IDevice> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IDevice[]> {
        return [...this.storage.values()];
    }

    async add(id: number, data: IDevice): Promise<IDevice> {
        this.storage.set(id, data);

        return data;
    }
}
