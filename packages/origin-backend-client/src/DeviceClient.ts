import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IDevice,
    IDeviceWithRelationsIds,
    IExternalDeviceId,
    ISmartMeterRead,
    ISmartMeterReadWithStatus,
    ISuccessResponse
} from '@energyweb/origin-backend-core';
import { bigNumberify } from 'ethers/utils';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IDeviceClient {
    getById(id: number): Promise<IDeviceWithRelationsIds>;
    getByExternalId(id: IExternalDeviceId): Promise<IDeviceWithRelationsIds>;
    getAll(withMeterStats: boolean): Promise<IDeviceWithRelationsIds[]>;
    add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds>;
    update(id: number, data: DeviceUpdateData): Promise<IDevice>;
    getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]>;
    addSmartMeterRead(id: number, smartMeterRead: ISmartMeterRead): Promise<void>;
    getSupplyBy(facilityName: string, status: number): Promise<IDeviceWithRelationsIds[]>;
    delete(id: number): Promise<ISuccessResponse>;
    updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<ISuccessResponse>;
    getMyDevices(withMeterStats: boolean): Promise<IDeviceWithRelationsIds[]>;
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

    public async getAll(withMeterStats = false): Promise<IDeviceWithRelationsIds[]> {
        const { data } = await this.requestClient.get<void, IDeviceWithRelationsIds[]>(
            `${this.endpoint}?withMeterStats=${withMeterStats}`
        );

        return data.map((device) => this.cleanDeviceData(device));
    }

    public async add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds> {
        const { data } = await this.requestClient.post<DeviceCreateData, IDeviceWithRelationsIds>(
            this.endpoint,
            device
        );

        return this.cleanDeviceData(data);
    }

    public async update(
        id: number,
        updateData: DeviceUpdateData
    ): Promise<IDeviceWithRelationsIds> {
        const { data } = await this.requestClient.put<DeviceUpdateData, IDeviceWithRelationsIds>(
            `${this.endpoint}/${id}`,
            updateData
        );

        return this.cleanDeviceData(data);
    }

    public async getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]> {
        const response = await this.requestClient.get<void, ISmartMeterReadWithStatus[]>(
            `${this.endpoint}/${id}/smartMeterReading`
        );

        const meterReadingsFormatted: ISmartMeterReadWithStatus[] = response.data.map(
            (read: ISmartMeterReadWithStatus) => ({
                ...read,
                meterReading: bigNumberify(read.meterReading)
            })
        );

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
        let cleanDevice = { ...device };

        if (device.meterStats) {
            cleanDevice = {
                ...cleanDevice,
                meterStats: {
                    certified: bigNumberify(device.meterStats.certified),
                    uncertified: bigNumberify(device.meterStats.uncertified)
                }
            };
        }

        if (device.smartMeterReads) {
            cleanDevice = {
                ...cleanDevice,
                smartMeterReads: device.smartMeterReads.map((smRead) => ({
                    ...smRead,
                    meterReading: bigNumberify(smRead.meterReading)
                }))
            };
        }

        return cleanDevice;
    }

    public async getSupplyBy(
        facilityName: string,
        status: number
    ): Promise<IDeviceWithRelationsIds[]> {
        const { data } = await this.requestClient.get<unknown, IDeviceWithRelationsIds[]>(
            `${this.endpoint}/supplyBy?facility=${facilityName ?? ''}&status=${status}`
        );
        return data.map((device) => this.cleanDeviceData(device));
    }

    public async delete(id: number): Promise<ISuccessResponse> {
        const { data } = await this.requestClient.delete<void, ISuccessResponse>(
            `${this.endpoint}/${id}`
        );

        return data;
    }

    public async updateDeviceSettings(
        id: number,
        device: DeviceSettingsUpdateData
    ): Promise<ISuccessResponse> {
        const { data } = await this.requestClient.put<DeviceSettingsUpdateData, ISuccessResponse>(
            `${this.endpoint}/${id}/settings`,
            device
        );

        return data;
    }

    public async getMyDevices(withMeterStats = false): Promise<IDeviceWithRelationsIds[]> {
        const { data } = await this.requestClient.get<void, IDeviceWithRelationsIds[]>(
            `${this.endpoint}/my-devices?withMeterStats=${withMeterStats}`
        );

        return data.map((device) => this.cleanDeviceData(device));
    }
}
