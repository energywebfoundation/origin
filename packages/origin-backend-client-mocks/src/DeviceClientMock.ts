/*  eslint-disable @typescript-eslint/no-unused-vars */
import {
    DeviceStatus,
    DeviceUpdateData,
    IDevice,
    IExternalDeviceId,
    ISmartMeterRead,
    ISmartMeterReadWithStatus,
    DeviceSettingsUpdateData,
    ISuccessResponse,
    sortLowestToHighestTimestamp,
    IDeviceClient
} from '@energyweb/origin-backend-core';

export class DeviceClientMock implements IDeviceClient {
    private storage = new Map<number, IDevice>();

    private idCounter = 0;

    async getByExternalId(id: IExternalDeviceId): Promise<IDevice> {
        return [...this.storage.values()].find((d) =>
            d.externalDeviceIds?.find((i) => i.type === id.type && i.id === id.id)
        );
    }

    async getById(id: number): Promise<IDevice> {
        return this.storage.get(id);
    }

    async getAll(withMeterStats: boolean): Promise<IDevice[]> {
        return [...this.storage.values()];
    }

    async add(data: IDevice): Promise<IDevice> {
        this.idCounter++;

        const device: IDevice = {
            ...data,
            id: this.idCounter,
            status: data.status ?? DeviceStatus.Submitted,
            smartMeterReads: data.smartMeterReads ?? [],
            deviceGroup: data.deviceGroup ?? ''
        };

        this.storage.set(device.id, device);

        return device;
    }

    async update(id: number, data: DeviceUpdateData): Promise<IDevice> {
        const device = this.storage.get(id);

        Object.assign(device, data);

        this.storage.set(id, device);

        return device;
    }

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]> {
        const { smartMeterReads } = this.storage.get(id);

        return smartMeterReads.map((smRead) => ({
            ...smRead,
            certified: false
        }));
    }

    public async addSmartMeterReads(id: number, smartMeterReads: ISmartMeterRead[]): Promise<void> {
        const device = this.storage.get(id);

        if (!device.smartMeterReads) {
            device.smartMeterReads = [];
        }

        device.smartMeterReads = [...device.smartMeterReads, ...smartMeterReads].sort(
            sortLowestToHighestTimestamp
        );

        this.storage.set(id, device);
    }

    public async getSupplyBy(facilityName: string, status: number): Promise<IDevice[]> {
        return [...this.storage.values()];
    }

    public async delete(id: number): Promise<ISuccessResponse> {
        throw new Error('Method not implemented.');
    }

    public async updateDeviceSettings(
        id: number,
        device: DeviceSettingsUpdateData
    ): Promise<ISuccessResponse> {
        throw new Error('Method not implemented.');
    }

    public async getMyDevices(withMeterStats: boolean): Promise<IDevice[]> {
        throw new Error('Method not implemented.');
    }
}
