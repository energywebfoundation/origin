import axios from 'axios';
import { IDevice } from '@energyweb/origin-backend-core';

export interface IDeviceClient {
    getById(id: number): Promise<IDevice>;
    getAll(): Promise<IDevice[]>;
    add(id: number, device: IDevice): Promise<IDevice>;
}

export class DeviceClient implements IDeviceClient {
    private baseURL: string;

    constructor(_baseUrl: string) {
        this.baseURL = _baseUrl;
    }

    private get endpoint() {
        return `${this.baseURL}/Device`;
    }

    public async getById(id: number): Promise<IDevice> {
        const url = `${this.endpoint}/${id}`;
        const { data } = await axios.get(url);

        return data;
    }

    public async getAll(): Promise<IDevice[]> {
        const { data } = await axios.get(this.endpoint);

        return data;
    }

    public async add(id: number, device: IDevice): Promise<IDevice> {
        const url = `${this.endpoint}/${id}`;
        const { data } = await axios.post(url, device);

        return data;
    }
}
