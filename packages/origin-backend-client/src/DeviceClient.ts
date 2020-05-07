import {
    IDevice,
    DeviceUpdateData,
    ISmartMeterRead,
    DeviceCreateData,
    IDeviceWithRelationsIds,
    IExternalDeviceId,
    ISmartMeterReadWithStatus
} from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';
import { bigNumberify } from 'ethers/utils';

export interface IDeviceClient {
    getById(id: number): Promise<IDeviceWithRelationsIds>;
    getByExternalId(id: IExternalDeviceId): Promise<IDeviceWithRelationsIds>;
    getAll(): Promise<IDeviceWithRelationsIds[]>;
    add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds>;
    update(id: number, data: DeviceUpdateData): Promise<IDevice>;
    getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]>;
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

    public async getByExternalId(id: IExternalDeviceId) {
        const url = `${this.endpoint}/get-by-external-id/${id.type}/${id.id}`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getById(id: number): Promise<IDeviceWithRelationsIds> {
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

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]> {
        const response = await this.requestClient.get<void, ISmartMeterReadWithStatus[]>(`${this.endpoint}/${id}/smartMeterReading`);

        // const meterReadingsFormatted: ISmartMeterRead[] = response.data.map((read: ISmartMeterRead) => {
        //     return {
        //         ...read,
        //         meterReading: bigNumberify(read.meterReading)    
        //     };
        // });

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
