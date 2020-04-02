import {
    UserRegisterReturnData,
    UserRegisterData,
    UserLoginData,
    UserLoginReturnData,
    UserUpdateData,
    IUserWithRelationsIds,
    IUserProperties
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

type UpdateUserResponseReturnType = IUserWithRelationsIds;

export interface IUserClient {
    login(email: string, password: string): Promise<UserLoginReturnData>;
    logout(): Promise<void>;
    register(data: UserRegisterData): Promise<UserRegisterReturnData>;
    me(): Promise<IUserWithRelationsIds>;
    getUserById(id: string): Promise<IUserWithRelationsIds>;
    getUserByBlockchainAccount(blockchainAccountAddress: string): Promise<IUserWithRelationsIds>;
    attachSignedMessage(id: number, signedMessage: string): Promise<UpdateUserResponseReturnType>;
    updateAdditionalProperties(
        id: number,
        properties: Partial<Pick<IUserProperties, 'autoPublish' | 'notifications'>>
    ): Promise<UpdateUserResponseReturnType>;
}

export class UserClient implements IUserClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get authEndpoint() {
        return `${this.dataApiUrl}/auth`;
    }

    private get userEndpoint() {
        return `${this.dataApiUrl}/user`;
    }

    public async register(formData: UserRegisterData): Promise<UserRegisterReturnData> {
        const url = `${this.userEndpoint}/register`;
        const { data } = await this.requestClient.post(url, formData);

        return data;
    }

    public async login(email: string, password: string) {
        const url = `${this.authEndpoint}/login`;
        const { data } = await this.requestClient.post<UserLoginData, UserLoginReturnData>(url, {
            username: email,
            password
        });

        if (data?.accessToken) {
            this.requestClient.authenticationToken = data.accessToken;
        }

        return data;
    }

    public async logout() {
        this.requestClient.authenticationToken = null;
    }

    public async me(): Promise<IUserWithRelationsIds> {
        const url = `${this.userEndpoint}/me`;
        const { data } = await this.requestClient.get<{}, IUserWithRelationsIds>(url);

        return data;
    }

    public async getUserByBlockchainAccount(
        blockchainAccountAddress: string
    ): Promise<IUserWithRelationsIds> {
        const url = `${this.userEndpoint}/for-blockchain-account/${blockchainAccountAddress}`;
        const { data } = await this.requestClient.get<{}, IUserWithRelationsIds>(url);

        return data;
    }

    public async attachSignedMessage(id: number, signedMessage: string) {
        return this.updateUser(id, { blockchainAccountSignedMessage: signedMessage });
    }

    public async updateAdditionalProperties(
        id: number,
        properties: Partial<Pick<IUserProperties, 'autoPublish' | 'notifications'>>
    ) {
        return this.updateUser(id, properties);
    }

    public async getUserById(id: string): Promise<IUserWithRelationsIds> {
        const url = `${this.userEndpoint}/${id}`;
        const { data } = await this.requestClient.get<{}, IUserWithRelationsIds>(url);

        return data;
    }

    private async updateUser(
        id: number,
        updatedUserInfo: UserUpdateData
    ): Promise<IUserWithRelationsIds> {
        const url = `${this.userEndpoint}/${id}`;
        const { data } = await this.requestClient.put(url, updatedUserInfo);

        return data;
    }
}
