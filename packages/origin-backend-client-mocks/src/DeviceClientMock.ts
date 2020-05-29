import { IDeviceClient } from '@energyweb/origin-backend-client';
import {
    DeviceStatus,
    DeviceUpdateData,
    IDevice,
    IDeviceWithRelationsIds,
    IExternalDeviceId,
    ISmartMeterRead,
    ISmartMeterReadWithStatus,
    DeviceSettingsUpdateData
} from '@energyweb/origin-backend-core';

export class DeviceClientMock implements IDeviceClient {
    
    private storage = new Map<number, IDeviceWithRelationsIds>();

    private idCounter = 0;

    async getByExternalId(id: IExternalDeviceId): Promise<IDeviceWithRelationsIds> {
        return [...this.storage.values()].find((d) =>
            d.externalDeviceIds?.find((i) => i.type === id.type && i.id === id.id)
        );
    }

    async getById(id: number): Promise<IDeviceWithRelationsIds> {
        return this.storage.get(id);
    }

    async getAll(): Promise<IDeviceWithRelationsIds[]> {
        return [...this.storage.values()];
    }

    async add(data: IDeviceWithRelationsIds): Promise<IDeviceWithRelationsIds> {
        this.idCounter++;

        const device: IDeviceWithRelationsIds = {
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

        return smartMeterReads.map(smRead => ({
            ...smRead,
            certified: false
        }));
    }

    public async addSmartMeterRead(id: number, smartMeterRead: ISmartMeterRead): Promise<void> {
        const device = this.storage.get(id);

        if (!device.smartMeterReads) {
            device.smartMeterReads = [];
        }

        device.smartMeterReads.push(smartMeterRead);
        device.smartMeterReads = device.smartMeterReads.sort((a, b) =>
            a.timestamp > b.timestamp ? 1 : b.timestamp > a.timestamp ? -1 : 0
        );

        this.storage.set(id, device);
    }

    public async getSupplyBy(facilityName: string, status: DeviceStatus): Promise<IDeviceWithRelationsIds[]> {
        return [...this.storage.values()];
    }

    public async delete(id: number): Promise<void> {
        
    }

    public async updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<void> {

    }
    
}
