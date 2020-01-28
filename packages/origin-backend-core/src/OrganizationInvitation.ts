import { IOrganization } from './Organization';

export enum OrganizationInvitationStatus {
    Pending,
    Rejected,
    Accepted
}

export interface IOrganizationInvtationProperties {
    id: number;
    email: string;
    status: OrganizationInvitationStatus;
}

export interface IOrganizationInvitation extends IOrganizationInvtationProperties {
    organization: IOrganization | IOrganization['id'];
}

export interface IOrganizationInvitationWithRelations extends IOrganizationInvitation {
    organization: IOrganization;
}

export type OrganizationInviteCreateData = { email: string };
export type OrganizationInviteCreateReturnData = { success: boolean; error: string };

export type OrganizationInviteUpdateData = Pick<IOrganizationInvitation, 'status'>;
