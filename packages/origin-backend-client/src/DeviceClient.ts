import {
    IDevice,
    DeviceUpdateData,
    ISmartMeterRead,
    DeviceCreateData,
    IDeviceWithRelationsIds
} from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IDeviceClient {
    getById(id: number): Promise<IDevice>;
    getAll(): Promise<IDeviceWithRelationsIds[]>;
    add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds>;
    update(id: number, data: DeviceUpdateData): Promise<IDevice>;
    getAllSmartMeterReadings(id: number): Promise<ISmartMeterRead[]>;
    addSmartMeterRead(id: number, smartMeterRead: ISmartMeterRead): Promise<void>;
}

export class DeviceClient implements IDeviceClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get endpoint() {
        return `${this.dataApiUrl}/Device`;
    }

    public async getById(id: number): Promise<IDevice> {
        const url = `${this.endpoint}/${id}`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getAll(): Promise<IDeviceWithRelationsIds[]> {
        const { data } = await this.requestClient.get(this.endpoint);

        return data;
    }

    public async add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds> {
        const { data } = await this.requestClient.post(this.endpoint, device);

        return data;
    }

    public async update(id: number, data: DeviceUpdateData): Promise<IDevice> {
        const response = await this.requestClient.put<DeviceUpdateData, IDevice>(
            `${this.endpoint}/${id}`,
            data
        );

        return response.data;
    }

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterRead[]> {
        const response = await this.requestClient.get(`${this.endpoint}/${id}/smartMeterReading`);

        return response.data;
    }

    public async addSmartMeterRead(id: number, smartMeterRead: ISmartMeterRead): Promise<void> {
        const response = await this.requestClient.put<ISmartMeterRead, void>(
            `${this.endpoint}/${id}/smartMeterReading`,
            smartMeterRead
        );

        return response.data;
    }
}
