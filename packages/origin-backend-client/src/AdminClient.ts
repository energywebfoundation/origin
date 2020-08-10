import {
    IUser,
    UserUpdateData,
    IUserFilter,
    IAdminClient,
    IRequestClient
} from '@energyweb/origin-backend-core';
import { RequestClient } from './RequestClient';

export class AdminClient implements IAdminClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    async update(formData: IUser): Promise<IUser> {
        const { data } = await this.requestClient.put<UserUpdateData, IUser>(
            `${this.endpoint}/users/${formData.id}`,
            formData
        );
        return data;
    }

    public async getUsers(filter?: IUserFilter): Promise<IUser[]> {
        const { data } = await this.requestClient.get<void, IUser[]>(`${this.endpoint}/users`, {
            params: filter
        });

        return data;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/admin`;
    }
}
