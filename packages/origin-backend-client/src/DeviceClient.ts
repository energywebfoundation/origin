import {
    IDevice,
    DeviceUpdateData,
    ISmartMeterRead,
    DeviceCreateData,
    IDeviceWithRelationsIds,
    IExternalDeviceId,
    ISmartMeterReadWithStatus,
    DeviceStatus,
    DeviceSettingsUpdateData
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
    getSupplyBy(facilityName: string, status: DeviceStatus): Promise<IDeviceWithRelationsIds[]>;
    delete(id: number): Promise<void>;
    updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<void>;
}

export class DeviceClient implements IDeviceClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}
    
    private get endpoint() {
        return `${this.dataApiUrl}/Device`;
    }

    public async getByExternalId(id: IExternalDeviceId): Promise<IDeviceWithRelationsIds> {
        const url = `${this.endpoint}/get-by-external-id/${id.type}/${id.id}`;
        const { data } = await this.requestClient.get<void, IDeviceWithRelationsIds>(url);

        return this.cleanDeviceData(data);
    }

    public async getById(id: number): Promise<IDeviceWithRelationsIds> {
        const url = `${this.endpoint}/${id}`;
        const { data } = await this.requestClient.get<void, IDeviceWithRelationsIds>(url);

        return this.cleanDeviceData(data);
    }

    public async getAll(): Promise<IDeviceWithRelationsIds[]> {
        const { data } = await this.requestClient.get<void, IDeviceWithRelationsIds[]>(this.endpoint);

        return data.map(device => this.cleanDeviceData(device));
    }

    public async add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds> {
        const { data } = await this.requestClient.post<DeviceCreateData, IDeviceWithRelationsIds>(this.endpoint, device);

        return this.cleanDeviceData(data);
    }

    public async update(id: number, updateData: DeviceUpdateData): Promise<IDeviceWithRelationsIds> {
        const { data } = await this.requestClient.put<DeviceUpdateData, IDeviceWithRelationsIds>(
            `${this.endpoint}/${id}`,
            updateData
        );

        return this.cleanDeviceData(data);
    }

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]> {
        const response = await this.requestClient.get<void, ISmartMeterReadWithStatus[]>(`${this.endpoint}/${id}/smartMeterReading`);

        const meterReadingsFormatted: ISmartMeterReadWithStatus[] = response.data.map((read: ISmartMeterReadWithStatus) => ({
            ...read,
            meterReading: bigNumberify(read.meterReading)    
        }));

        return meterReadingsFormatted;
    }

    public async addSmartMeterRead(id: number, smartMeterRead: ISmartMeterRead): Promise<void> {
        const response = await this.requestClient.put<ISmartMeterRead, void>(
            `${this.endpoint}/${id}/smartMeterReading`,
            smartMeterRead
        );

        return response.data;
    }

    /*
     *  GET requests return BigNumber in object format instead of BigNumber.
     *  This method cleans them back to BigNumber.
     */
    private cleanDeviceData(device: IDeviceWithRelationsIds): IDeviceWithRelationsIds {
        return {
            ...device,
            meterStats: {
                certified: bigNumberify(device.meterStats.certified),
                uncertified: bigNumberify(device.meterStats.uncertified)
            },
            smartMeterReads: device.smartMeterReads.map(smRead => ({
                ...smRead,
                meterReading: bigNumberify(smRead.meterReading)
            }))
        };
    }

    public async getSupplyBy(facilityName: string, status: DeviceStatus) {
        const { data } = await this.requestClient.get<unknown, IDeviceWithRelationsIds[]>(
            `${this.endpoint}/supplyBy?facility=${
                facilityName ?? ''
            }&status=${status}`
        );
        return data;
    }

    public async delete(id: number) {
        const { data } = await this.requestClient.delete<void, unknown>(
            `${this.endpoint}/${id}`
        );
    }

    public async updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<void> {
        const response = await this.requestClient.put<DeviceSettingsUpdateData, void>(
            `${this.endpoint}/${id}/settings`,
            device
        );
    }

    
}
