import { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import {
    IOriginConfiguration,
    UserUpdateData,
    IUserFilter,
    IUser,
    ISuccessResponse,
    UserLoginReturnData,
    UserRegisterReturnData,
    UserRegistrationData,
    IUserProperties,
    UserPasswordUpdate,
    EmailConfirmationResponse,
    IEmailConfirmationToken,
    UpdateUserResponseReturnType,
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationRole,
    IOrganizationInvitation,
    Role,
    onUploadProgressFunction,
    IExternalDeviceId,
    DeviceCreateData,
    DeviceUpdateData,
    IDevice,
    ISmartMeterReadWithStatus,
    ISmartMeterRead,
    DeviceSettingsUpdateData
} from '..';
import { IFullOrganization } from '../Organization';

export interface IAdminClient {
    update(formData: UserUpdateData): Promise<IUser>;
    getUsers(filter?: IUserFilter): Promise<IUser[]>;
}

export interface IConfigurationClient {
    get(): Promise<IOriginConfiguration>;
    update(configuration: Partial<IOriginConfiguration>): Promise<boolean>;
}

export interface IRequestClient {
    authenticationToken: string;

    get<T extends any, U extends any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<U>>;

    post<T extends any, U extends any>(
        url: string,
        data?: T,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<U>>;

    put<T extends any, U extends any>(
        url: string,
        data?: T,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<U>>;

    delete<T extends any, U extends any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<U>>;

    generateCancelToken(): CancelTokenSource;

    config: { headers?: any };
}

export interface IUserClient {
    login(email: string, password: string): Promise<UserLoginReturnData>;
    logout(): Promise<void>;
    register(data: UserRegistrationData): Promise<UserRegisterReturnData>;
    me(): Promise<IUser>;
    getUserById(id: string): Promise<IUser>;
    attachSignedMessage(signedMessage: string): Promise<UpdateUserResponseReturnType>;
    updateAdditionalProperties(
        properties: Partial<Pick<IUserProperties, 'notifications'>>
    ): Promise<UpdateUserResponseReturnType>;
    updateProfile(formData: IUser): Promise<IUser>;
    updatePassword(formData: UserPasswordUpdate): Promise<IUser>;
    updateChainAddress(formData: IUser): Promise<IUser>;
    confirmEmail(token: IEmailConfirmationToken['token']): Promise<EmailConfirmationResponse>;
    requestConfirmationEmail(): Promise<ISuccessResponse>;
}

export interface IOrganizationClient {
    getById(id: number): Promise<IFullOrganization>;
    getAll(): Promise<IFullOrganization[]>;
    add(data: OrganizationPostData): Promise<IFullOrganization>;
    update(id: number, data: OrganizationUpdateData): Promise<IFullOrganization>;

    getInvitationsForOrganization(organizationId: number): Promise<IOrganizationInvitation[]>;

    getMembers(id: number): Promise<IUser[]>;
    removeMember(organizationId: number, userId: number): Promise<ISuccessResponse>;
    memberChangeRole(
        organizationId: number,
        userId: number,
        newRole: Role
    ): Promise<ISuccessResponse>;
}

export interface IInvitationClient {
    invite(email: string, role: OrganizationRole): Promise<ISuccessResponse>;
    getInvitations(): Promise<IOrganizationInvitation[]>;
    acceptInvitation(id: number): Promise<ISuccessResponse>;
    rejectInvitation(id: number): Promise<ISuccessResponse>;
    viewInvitation(id: number): Promise<ISuccessResponse>;
    getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]>;
}

export interface IFilesClient {
    upload(
        files: File[] | FileList,
        onUploadProgress?: onUploadProgressFunction,
        cancelTokenSource?: CancelTokenSource
    ): Promise<string[]>;
    getLink(id: string): string;
    download(id: string): Promise<any>;
}

export interface IDeviceClient {
    getById(id: number, loadRelationIds?: boolean): Promise<IDevice>;
    getByExternalId(id: IExternalDeviceId): Promise<IDevice>;
    getAll(withMeterStats: boolean, loadRelationIds?: boolean): Promise<IDevice[]>;
    add(device: DeviceCreateData): Promise<IDevice>;
    update(id: number, data: DeviceUpdateData): Promise<IDevice>;
    getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]>;
    addSmartMeterReads(id: number, smartMeterReads: ISmartMeterRead[]): Promise<void>;
    getSupplyBy(facilityName: string, status: number): Promise<IDevice[]>;
    delete(id: number): Promise<ISuccessResponse>;
    updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<ISuccessResponse>;
    getMyDevices(withMeterStats: boolean): Promise<IDevice[]>;
}

export interface IOffChainDataSource {
    dataApiUrl: string;
    requestClient: IRequestClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    organizationClient: IOrganizationClient;
    filesClient: IFilesClient;
    adminClient: IAdminClient;
    invitationClient: IInvitationClient;
    deviceClient?: IDeviceClient;
}
