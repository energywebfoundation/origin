import { IPublicOrganization } from './Organization';
import { Role } from './User';

export enum OrganizationInvitationStatus {
    Pending,
    Rejected,
    Accepted,
    Viewed
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
    organization: IPublicOrganization;
    sender: string;
    createdAt: Date;
}

export type OrganizationInviteCreateData = { email: string; role: OrganizationRole };

export type OrganizationInviteUpdateData = Pick<IOrganizationInvitation, 'status'>;

export const ensureOrganizationRole = (role: Role): void => {
    if (
        role !== Role.OrganizationAdmin &&
        role !== Role.OrganizationDeviceManager &&
        role !== Role.OrganizationUser
    ) {
        throw new Error('Not an organization role');
    }
};
