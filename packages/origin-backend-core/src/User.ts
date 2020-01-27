import { IOrganization } from './Organization';

export interface IUserProperties {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    blockchainAccountAddress: string;
    blockchainAccountSignedMessage: string;
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

export type UserRegisterData = Omit<IUserProperties, 'id'> & { password: string };
export type UserRegisterReturnData = IUser;

export type UserLoginData = { username: string; password: string };
export type UserLoginReturnData = { accessToken: string };

export type UserUpdateData = Pick<IUserProperties, 'blockchainAccountSignedMessage'>;
