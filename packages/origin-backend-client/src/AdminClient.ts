import { IUser, UserUpdateData, IUserWithRelations } from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IAdminClient {
    update(formData: UserUpdateData): Promise<IUserWithRelations>;
    getAllUsers(): Promise<IUser[]>;
    getUsersBy(orgName: string, status: number, kycStatus: number): Promise<IUser[]>;
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
    
    public async getUsersBy(orgName: string,status: number, kycStatus: number) {
        orgName = orgName == null?'':orgName;
        status = isNaN(status)?0:status;
        kycStatus = isNaN(kycStatus)?0:kycStatus;
        const { data } = await this.requestClient.get(`${this.endpoint}/usersBy?orgName=` + orgName + `&status=` + status + `&kycStatus=` + kycStatus );
        return data;
    }

    private get endpoint() {
        return `${this.dataApiUrl}/admin`;
    }
}
