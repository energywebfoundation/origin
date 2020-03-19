import { IOrganization } from './Organization';

type Currency = string;

/*
    no role:          0x0...------0 = 0
    UserAdmin:        0x0...------1 = 1
    DeviceAdmin:      0x0...-----1- = 2
    DeviceManager:    0x0...----1-- = 4
    Trader:           0x0...---1--- = 8
    Issuer:           0x0...--1---- = 16
*/
export enum Role {
    UserAdmin,
    DeviceAdmin,
    DeviceManager,
    Trader,
    Issuer
}

export function buildRights(roles: Role[]): number {
    if (!roles) {
        return 0;
    }

    return roles.reduce((a, b) => {
        return a | Math.pow(2, b);
    }, 0);
}

export function isRole(user: IUser, role: Role): boolean {
    if (!user) {
        return false;
    }

    const roleTransfomed = Math.pow(2, role);

    return (user.rights & roleTransfomed) !== 0;
}

export interface IAutoPublishConfig {
    enabled: boolean;
    currency: Currency;
    priceInCents: number;
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
    autoPublish: IAutoPublishConfig;
    rights: number;
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
    | 'id'
    | 'blockchainAccountAddress'
    | 'blockchainAccountSignedMessage'
    | 'autoPublish'
    | 'notifications'
> & { password: string } & Partial<Pick<IUserProperties, 'autoPublish' | 'notifications'>>;

export type UserRegisterReturnData = IUser;

export type UserLoginData = { username: string; password: string };
export type UserLoginReturnData = { accessToken: string };

export type UserUpdateData = Partial<
    Pick<IUserProperties, 'blockchainAccountSignedMessage' | 'autoPublish' | 'notifications'>
>;
