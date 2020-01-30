import { IDevice, DeviceUpdateData } from '@energyweb/origin-backend-core';

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

    async update(
        id: number,
        data: DeviceUpdateData
    ): Promise<IDevice> {
        const device = this.storage.get(id);

        Object.assign(device, data);

        this.storage.set(id, device);

        return device;
    }
}

