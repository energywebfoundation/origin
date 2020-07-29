import {
    UserRegisterReturnData,
    UserRegistrationData,
    UserLoginData,
    UserLoginReturnData,
    UserUpdateData,
    IUserWithRelationsIds,
    IUserProperties,
    IUserWithRelations,
    IUser,
    UserPasswordUpdate,
    IEmailConfirmationToken,
    EmailConfirmationResponse,
    ISuccessResponse,
    IUserClient,
    IRequestClient
} from '@energyweb/origin-backend-core';

import { RequestClient } from './RequestClient';

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

    public async register(formData: UserRegistrationData): Promise<UserRegisterReturnData> {
        const url = `${this.userEndpoint}/register`;
        const { data } = await this.requestClient.post<
            UserRegistrationData,
            UserRegisterReturnData
        >(url, formData);

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
        const { data } = await this.requestClient.get<unknown, IUserWithRelationsIds>(url);

        return data;
    }

    public async attachSignedMessage(signedMessage: string) {
        return this.updateUser({ blockchainAccountSignedMessage: signedMessage });
    }

    public async updateAdditionalProperties(
        properties: Partial<Pick<IUserProperties, 'notifications'>>
    ) {
        return this.updateUser(properties);
    }

    public async getUserById(id: string): Promise<IUserWithRelationsIds> {
        const url = `${this.userEndpoint}/${id}`;
        const { data } = await this.requestClient.get<unknown, IUserWithRelationsIds>(url);

        return data;
    }

    private async updateUser(updatedUserInfo: UserUpdateData): Promise<IUserWithRelationsIds> {
        const { data } = await this.requestClient.put<UserUpdateData, IUserWithRelationsIds>(
            this.userEndpoint,
            updatedUserInfo
        );

        return data;
    }

    public async updateProfile(formData: IUser): Promise<IUserWithRelations> {
        const response = await this.requestClient.put<UserUpdateData, IUserWithRelations>(
            `${this.userEndpoint}/profile`,
            formData
        );
        return response.data;
    }

    public async updatePassword(formData: UserPasswordUpdate): Promise<IUserWithRelations> {
        const response = await this.requestClient.put<UserPasswordUpdate, IUserWithRelations>(
            `${this.userEndpoint}/password`,
            formData
        );
        return response.data;
    }

    public async updateChainAddress(formData: IUser): Promise<IUserWithRelations> {
        const response = await this.requestClient.put<UserUpdateData, IUserWithRelations>(
            `${this.userEndpoint}/chainAddress`,
            formData
        );
        return response.data;
    }

    public async confirmEmail(
        token: IEmailConfirmationToken['token']
    ): Promise<EmailConfirmationResponse> {
        const response = await this.requestClient.put<
            IEmailConfirmationToken['token'],
            EmailConfirmationResponse
        >(`${this.userEndpoint}/confirm-email/${token}`);

        return response.data;
    }

    public async requestConfirmationEmail(): Promise<ISuccessResponse> {
        const response = await this.requestClient.put<void, ISuccessResponse>(
            `${this.userEndpoint}/re-send-confirm-email`
        );

        return response.data;
    }
}
