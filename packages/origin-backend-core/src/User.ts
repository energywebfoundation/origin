import { IOrganization } from './Organization';

export enum Role {
    OrganizationAdmin = 1,
    OrganizationDeviceManager = 2,
    OrganizationUser = 4,
    Issuer = 8,
    Admin = 16,
    SupportAgent = 32
}

export enum Status {
    'Pending',
    'Active',
    'Suspended',
    'Deleted'
}

export enum KYCStatus {
    'Pending KYC',
    'KYC passed',
    'KYC rejected'
}

export function buildRights(roles: Role[]): number {
    if (!roles) {
        return 0;
    }

    return roles.reduce((a, b) => {
        return a | b;
    }, 0);
}

export function isRole(user: { rights: number }, ...roles: Role[]): boolean {
    return roles.some((role) => (user?.rights & role) !== 0);
}

export interface IUserProperties {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    blockchainAccountAddress: string;
    blockchainAccountSignedMessage: string;
    notifications: boolean;
    rights: number;
    status: number;
    kycStatus: number;
}

export interface IUser extends IUserProperties {
    organization: IOrganization | IOrganization['id'];
}

export interface IUserWithRelationsIds extends IUser {
    organization: IOrganization['id'];
}

export interface IUserWithRelations extends IUser {
    organization: IOrganization;
}

export type UserRegisterData = Omit<
    IUserProperties,
    'id' | 'blockchainAccountAddress' | 'blockchainAccountSignedMessage'
> & { password: string };

export type UserRegisterReturnData = IUser;

export type UserLoginData = { username: string; password: string };
export type UserLoginReturnData = { accessToken: string };

export type UserUpdateData = Partial<
    Pick<IUserProperties, 'blockchainAccountSignedMessage' | 'notifications'>
>;
