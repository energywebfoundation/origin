import {
    DemandPostData,
    IDemand,
    DemandUpdateData
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export interface IDemandClient {
    getById(id: number): Promise<IDemand>;
    getAll(): Promise<IDemand[]>;
    add(data: DemandPostData): Promise<IDemand>;
    update(id: number, data: DemandUpdateData): Promise<IDemand>;
    delete(id: number): Promise<any>;
}

export class DemandClient implements IDemandClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get endpoint() {
        return `${this.dataApiUrl}/Demand`;
    }

    public async getById(id: number): Promise<IDemand> {
        if (typeof id === 'undefined') {
            return null;
        }

        const url = `${this.endpoint}/${id}`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getAll(): Promise<IDemand[]> {
        const { data } = await this.requestClient.get(this.endpoint);

        return data;
    }

    public async add(data: DemandPostData): Promise<IDemand> {
        const response = await this.requestClient.post<DemandPostData, IDemand>(this.endpoint, data);

        return response.data;
    }

    public async update(
        id: number,
        data: DemandUpdateData
    ): Promise<IDemand> {
        const response = await this.requestClient.put<DemandUpdateData, IDemand>(`${this.endpoint}/${id}`, data);

        return response.data;
    }

    public async delete(id: number): Promise<any> {
        const response = await this.requestClient.delete<number, any>(`${this.endpoint}/${id}`);

        return response.data;
    }
}
