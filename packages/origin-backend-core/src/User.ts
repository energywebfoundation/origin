import { IEmailConfirmation } from './EmailConfirmation';
import { IFullOrganization } from './Organization';

export enum Role {
    OrganizationAdmin = 1,
    OrganizationDeviceManager = 2,
    OrganizationUser = 4,
    Issuer = 8,
    Admin = 16,
    SupportAgent = 32
}

export enum UserStatus {
    Pending = 'Pending',
    Active = 'Active',
    Suspended = 'Suspended',
    Deleted = 'Deleted'
}

export enum KYCStatus {
    Pending = 'Pending',
    Passed = 'Passed',
    Rejected = 'Rejected'
}

export function buildRights(roles: Role[]): number {
    if (!roles) {
        return 0;
    }

    return roles.reduce((a, b) => {
        return a | b;
    }, 0);
}

export const getRolesFromRights = (rights: number): Role[] => {
    if (!rights) {
        return [];
    }

    const rolesKeys = Object.keys(Role);
    const roles: Role[] = rolesKeys.splice(0, rolesKeys.length / 2).map((value) => Number(value));

    return roles.filter((role) => rights & role);
};

export const isRole = (user: { rights: number }, ...roles: Role[]): boolean =>
    roles.some((role) => (user?.rights & role) !== 0);

export interface IUserProperties {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    notifications: boolean;
    rights: number;
    status: UserStatus;
    kycStatus: KYCStatus;
}

export interface IUser extends IUserProperties {
    organization: IFullOrganization;
    emailConfirmed?: IEmailConfirmation['confirmed'];
}

export type UserRegisterReturnData = IUser;

export type UserLoginReturnData = { accessToken: string };

export type UserStatusUpdate = Partial<Pick<IUserProperties, 'status' | 'kycStatus'>>;

export type UserPasswordUpdate = { oldPassword: string; newPassword: string };

export interface IUserFilter {
    orgName?: string;
    status?: UserStatus;
    kycStatus?: KYCStatus;
}

export type UpdateUserResponseReturnType = IUser;
