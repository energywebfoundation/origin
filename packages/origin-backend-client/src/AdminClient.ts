import { IUser, UserUpdateData, IUserWithRelations } from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IAdminClient {
    update(formData: UserUpdateData): Promise<IUserWithRelations>;
    getAllUsers(): Promise<IUser[]>;
}

export class AdminClient implements IAdminClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    async update(formData: IUser) {
        const response = await this.requestClient.put(`${this.endpoint}/users/` + formData.id,formData);
        return response.data;
    }

    public async getAllUsers() {
        const { data } = await this.requestClient.get(`${this.endpoint}/users`);
        return data;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/admin`;
    }
}
