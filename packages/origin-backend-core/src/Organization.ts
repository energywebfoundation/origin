import { IUser, Role } from './User';
import { IDevice } from '.';

export enum OrganizationStatus {
    Submitted,
    Denied,
    Active
}

export interface IOrganizationProperties {
    id: number;

    activeCountries: string;

    code: string;

    name: string;

    contact: string;

    telephone: string;

    email: string;

    address: string;

    shareholders: string;

    ceoPassportNumber: string;

    ceoName: string;

    companyNumber: string;

    vatNumber: string;

    postcode: string;

    headquartersCountry: number;

    country: number;

    businessTypeSelect: string;

    businessTypeInput: string;

    yearOfRegistration: number;

    numberOfEmployees: number;

    website: string;

    status: OrganizationStatus;
}

export interface IOrganization extends IOrganizationProperties {
    users: Array<IUser | IUser['id']>;
    devices: Array<IDevice | IDevice['id']>;
}

export interface IOrganizationWithRelationsIds extends IOrganization {
    users: Array<IUser['id']>;
    devices: Array<IDevice['id']>;
}

export interface IOrganizationWithRelations extends IOrganization {
    users: IUser[];
}

export type OrganizationPostData = Omit<IOrganizationProperties, 'id' | 'status'>;

export type OrganizationUpdateData = Pick<IOrganization, 'status'>;

export interface IOrganizationUpdateMemberRole {
    role: Role;
}
