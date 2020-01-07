import axios from 'axios';
import {
    IOrganization,
    OrganizationPostData,
    OrganizationUpdateData
} from '@energyweb/origin-backend-core';

export interface IOrganizationClient {
    getById(id: number): Promise<IOrganization>;
    getAll(): Promise<IOrganization[]>;
    add(data: OrganizationPostData): Promise<IOrganization>;
    update(id: number, data: OrganizationUpdateData): Promise<IOrganization>;
}

export class OrganizationClient implements IOrganizationClient {
    private baseURL: string;

    constructor(_baseUrl: string) {
        this.baseURL = _baseUrl;
    }

    private get endpoint() {
        return `${this.baseURL}/Organization`;
    }

    public async getById(id: number): Promise<IOrganization> {
        const url = `${this.endpoint}/${id}`;
        const { data } = await axios.get(url);

        return data;
    }

    public async getAll(): Promise<IOrganization[]> {
        const { data } = await axios.get(this.endpoint);

        return data;
    }

    public async add(data: OrganizationPostData): Promise<IOrganization> {
        const response = await axios.post(this.endpoint, data);

        return response.data;
    }

    public async update(id: number, data: OrganizationUpdateData): Promise<IOrganization> {
        const response = await axios.put(`${this.endpoint}/${id}`, data);

        return response.data;
    }
}
