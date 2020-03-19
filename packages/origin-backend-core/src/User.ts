import { IOrganization } from './Organization';

type Currency = string;

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
