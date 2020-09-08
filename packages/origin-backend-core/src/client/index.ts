import { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import {
    IOriginConfiguration,
    UserUpdateData,
    IUserFilter,
    IUser,
    IOwnershipCommitmentProofWithTx,
    CommitmentStatus,
    CertificationRequestUpdateData,
    CertificationRequestValidationData,
    ICertificationRequest,
    ISuccessResponse,
    UserLoginReturnData,
    UserRegisterReturnData,
    UserRegistrationData,
    IUserProperties,
    UserPasswordUpdate,
    EmailConfirmationResponse,
    IEmailConfirmationToken,
    UpdateUserResponseReturnType,
    IOrganizationWithRelationsIds,
    OrganizationPostData,
    OrganizationUpdateData,
    OrganizationRole,
    IOrganizationInvitation,
    Role,
    onUploadProgressFunction,
    IDeviceWithRelationsIds,
    IExternalDeviceId,
    DeviceCreateData,
    DeviceUpdateData,
    IDevice,
    ISmartMeterReadWithStatus,
    ISmartMeterRead,
    DeviceSettingsUpdateData
} from '..';

export interface IAdminClient {
    update(formData: UserUpdateData): Promise<IUser>;
    getUsers(filter?: IUserFilter): Promise<IUser[]>;
}

export interface IConfigurationClient {
    get(): Promise<IOriginConfiguration>;
    update(configuration: Partial<IOriginConfiguration>): Promise<boolean>;
}

export interface ICertificateClient {
    getOwnershipCommitment(certificateId: number): Promise<IOwnershipCommitmentProofWithTx>;
    addOwnershipCommitment(
        certificateId: number,
        data: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus>;
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

export interface ICertificationRequestClient {
    queueCertificationRequestData(data: CertificationRequestUpdateData): Promise<boolean>;
    validateGenerationPeriod(data: CertificationRequestValidationData): Promise<ISuccessResponse>;
    getCertificationRequest(id: ICertificationRequest['id']): Promise<ICertificationRequest>;
    getAllCertificationRequests(): Promise<ICertificationRequest[]>;
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
    getById(id: number): Promise<IOrganizationWithRelationsIds>;
    getAll(): Promise<IOrganizationWithRelationsIds[]>;
    add(data: OrganizationPostData): Promise<IOrganizationWithRelationsIds>;
    update(id: number, data: OrganizationUpdateData): Promise<IOrganizationWithRelationsIds>;

    invite(email: string, role: OrganizationRole): Promise<ISuccessResponse>;
    getInvitations(): Promise<IOrganizationInvitation[]>;
    getInvitationsToOrganization(organizationId: number): Promise<IOrganizationInvitation[]>;
    getInvitationsForEmail(email: string): Promise<IOrganizationInvitation[]>;
    acceptInvitation(id: number): Promise<any>;
    rejectInvitation(id: number): Promise<any>;
    viewInvitation(id: number): Promise<any>;

    getMembers(id: number): Promise<IUser[]>;
    removeMember(organizationId: number, userId: number): Promise<ISuccessResponse>;
    memberChangeRole(
        organizationId: number,
        userId: number,
        newRole: Role
    ): Promise<ISuccessResponse>;
}

export interface IFilesClient {
    upload(
        files: File[] | FileList,
        onUploadProgress?: onUploadProgressFunction,
        cancelTokenSource?: CancelTokenSource
    ): Promise<string[]>;
    getLink(id: string): string;
}

export interface IDeviceClient {
    getById(id: number, loadRelationIds?: boolean): Promise<IDevice>;
    getByExternalId(id: IExternalDeviceId): Promise<IDeviceWithRelationsIds>;
    getAll(withMeterStats: boolean, loadRelationIds?: boolean): Promise<IDevice[]>;
    add(device: DeviceCreateData): Promise<IDeviceWithRelationsIds>;
    update(id: number, data: DeviceUpdateData): Promise<IDevice>;
    getAllSmartMeterReadings(id: number): Promise<ISmartMeterReadWithStatus[]>;
    addSmartMeterReads(id: number, smartMeterReads: ISmartMeterRead[]): Promise<void>;
    getSupplyBy(facilityName: string, status: number): Promise<IDeviceWithRelationsIds[]>;
    delete(id: number): Promise<ISuccessResponse>;
    updateDeviceSettings(id: number, device: DeviceSettingsUpdateData): Promise<ISuccessResponse>;
    getMyDevices(withMeterStats: boolean): Promise<IDeviceWithRelationsIds[]>;
}

export interface IOffChainDataSource {
    dataApiUrl: string;
    requestClient: IRequestClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    organizationClient: IOrganizationClient;
    filesClient: IFilesClient;
    adminClient: IAdminClient;

    certificateClient?: ICertificateClient;
    certificationRequestClient?: ICertificationRequestClient;
    deviceClient?: IDeviceClient;
}
