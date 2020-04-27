import { IUser } from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IAdminClient {
    getAllUsers(): Promise<IUser[]>;
}

export class AdminClient implements IAdminClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async getAllUsers() {
        const { data } = await this.requestClient.get(`${this.endpoint}/users`);
        return data;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/admin`;
    }
}
