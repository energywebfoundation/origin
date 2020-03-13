import moment from 'moment';
import { IDevice, DeviceUpdateData, DeviceStatusChanged, SupportedEvents, IEvent, ISmartMeterRead } from '@energyweb/origin-backend-core';

import { IDeviceClient, IEventClient } from '@energyweb/origin-backend-client';

export class DeviceClientMock implements IDeviceClient {
    private storage = new Map<number, IDevice>();

    constructor(public eventClient: IEventClient) {}

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

        const event: DeviceStatusChanged = {
            deviceId: id.toString(),
            status: data.status
        };

        const sendEvent: IEvent = {
            type: SupportedEvents.DEVICE_STATUS_CHANGED,
            data: event,
            timestamp: moment().unix()
        };

        (this.eventClient as any).triggerEvent(sendEvent);

        return device;
    }

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterRead[]> {
        const { smartMeterReads } = this.storage.get(id);

        return smartMeterReads;
    }

    public async addSmartMeterRead(
        id: number,
        smartMeterRead: ISmartMeterRead
    ): Promise<void> {
        const device = this.storage.get(id);

        if (!device.smartMeterReads) {
            device.smartMeterReads = [];
        }

        device.smartMeterReads.push(smartMeterRead);
        device.smartMeterReads = device.smartMeterReads.sort((a,b) => (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0));

        device.lastSmartMeterReading = device.smartMeterReads[device.smartMeterReads.length - 1];

        this.storage.set(id, device);
    }
}

