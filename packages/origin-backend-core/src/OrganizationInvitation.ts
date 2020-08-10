import { IOrganization } from './Organization';
import { Role } from './User';

export enum OrganizationInvitationStatus {
    Pending,
    Rejected,
    Accepted
}

export type OrganizationRole =
    | Role.OrganizationUser
    | Role.OrganizationDeviceManager
    | Role.OrganizationAdmin;

export interface IOrganizationInvitationProperties {
    id: number;
    email: string;
    role: OrganizationRole;
    status: OrganizationInvitationStatus;
}

export interface IOrganizationInvitation extends IOrganizationInvitationProperties {
    organization: IOrganization;
}

export type OrganizationInviteCreateData = { email: string; role: OrganizationRole };

export type OrganizationInviteUpdateData = Pick<IOrganizationInvitation, 'status'>;
