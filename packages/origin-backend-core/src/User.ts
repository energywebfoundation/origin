import { IOrganization } from './Organization';

/*
    no role:          0x0...------0 = 0
    UserAdmin:        0x0...------1 = 1
    DeviceAdmin:      0x0...-----1- = 2
    DeviceManager:    0x0...----1-- = 4
    Trader:           0x0...---1--- = 8
    Issuer:           0x0...--1---- = 16
    Admin:            0x0...-1----- = 32
    SupportAgent:     0x0...1------ = 64
*/
export enum Role {
    UserAdmin,
    DeviceAdmin,
    DeviceManager,
    Trader,
    Issuer,
    Admin,
    SupportAgent
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
        return a | Math.pow(2, b);
    }, 0);
}

export function isRole({ rights }: { rights: number }, role: Role): boolean {
    return (rights & Math.pow(2, role)) !== 0;
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
