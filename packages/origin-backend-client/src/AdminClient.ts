import {
    IUser,
    UserUpdateData,
    IUserWithRelations,
    IUserFilter
} from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IAdminClient {
    update(formData: UserUpdateData): Promise<IUserWithRelations>;
    getUsers(filter?: IUserFilter): Promise<IUser[]>;
}

export class AdminClient implements IAdminClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    async update(formData: IUser) {
        const response = await this.requestClient.put<UserUpdateData, IUserWithRelations>(
            `${this.endpoint}/users/${formData.id}`,
            formData
        );
        return response.data;
    }

    public async getUsers(filter?: IUserFilter) {
        const { data } = await this.requestClient.get<unknown, IUser[]>(
            `${this.endpoint}/users`,
            { params: filter }
        );

        return data;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/admin`;
    }
}
