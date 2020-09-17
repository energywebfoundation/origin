import {
    DeviceCreateData,
    DeviceSettingsUpdateData,
    DeviceUpdateData,
    IExternalDeviceId,
    ISmartMeterRead,
    ISmartMeterReadWithStatus,
    ISuccessResponse,
    IDeviceClient,
    IRequestClient,
    IDevice,
    IEnergyGeneratedWithStatus
} from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { RequestClient } from './RequestClient';

export class DeviceClient implements IDeviceClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get endpoint() {
        return `${this.dataApiUrl}/Device`;
    }

    public async getByExternalId(id: IExternalDeviceId): Promise<IDevice> {
        const url = `${this.endpoint}/get-by-external-id/${id.type}/${id.id}`;
        const { data } = await this.requestClient.get<void, IDevice>(url);

        return this.cleanDeviceData(data);
    }

    public async getById(id: number, loadRelationIds = true): Promise<IDevice> {
        const url = `${this.endpoint}/${id}?loadRelationIds=${loadRelationIds}`;
        const { data } = await this.requestClient.get<void, IDevice>(url);

        return this.cleanDeviceData(data);
    }

    public async getAll(withMeterStats = false, loadRelationIds = true): Promise<IDevice[]> {
        const { data } = await this.requestClient.get<void, IDevice[]>(
            `${this.endpoint}?withMeterStats=${withMeterStats}&loadRelationIds=${loadRelationIds}`
        );

        return data.map((device) => this.cleanDeviceData(device));
    }

    public async add(device: DeviceCreateData): Promise<IDevice> {
        const { data } = await this.requestClient.post<DeviceCreateData, IDevice>(
            this.endpoint,
            device
        );

        return this.cleanDeviceData(data);
    }

    public async update(id: number, updateData: DeviceUpdateData): Promise<IDevice> {
        const { data } = await this.requestClient.put<DeviceUpdateData, IDevice>(
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
                meterReading: BigNumber.from(read.meterReading)
            })
        );

        return meterReadingsFormatted;
    }

    public async addSmartMeterReads(id: number, smartMeterRead: ISmartMeterRead[]): Promise<void> {
        const response = await this.requestClient.put<ISmartMeterRead[], void>(
            `${this.endpoint}/${id}/smartMeterReading`,
            smartMeterRead
        );

        return response.data;
    }

    /*
     *  GET requests return BigNumber in object format instead of BigNumber.
     *  This method cleans them back to BigNumber.
     */
    private cleanDeviceData(device: IDevice): IDevice {
        let cleanDevice = { ...device };

        if (device.meterStats) {
            cleanDevice = {
                ...cleanDevice,
                meterStats: {
                    certified: BigNumber.from(device.meterStats.certified),
                    uncertified: BigNumber.from(device.meterStats.uncertified)
                }
            };
        }

        if (device.smartMeterReads) {
            cleanDevice = {
                ...cleanDevice,
                smartMeterReads: device.smartMeterReads.map((smRead) => ({
                    ...smRead,
                    meterReading: BigNumber.from(smRead.meterReading)
                }))
            };
        }

        return cleanDevice;
    }

    public async getSupplyBy(facilityName: string, status: number): Promise<IDevice[]> {
        const { data } = await this.requestClient.get<unknown, IDevice[]>(
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

    public async getMyDevices(withMeterStats = false): Promise<IDevice[]> {
        const { data } = await this.requestClient.get<void, IDevice[]>(
            `${this.endpoint}/my-devices?withMeterStats=${withMeterStats}`
        );

        return data.map((device) => this.cleanDeviceData(device));
    }
}
