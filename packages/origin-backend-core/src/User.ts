import { IPublicOrganization } from './Organization';
import { IEmailConfirmation } from './EmailConfirmation';

export enum Role {
    OrganizationAdmin = 1,
    OrganizationDeviceManager = 2,
    OrganizationUser = 4,
    Issuer = 8,
    Admin = 16,
    SupportAgent = 32
}

export enum UserStatus {
    Pending,
    Active,
    Suspended,
    Deleted
}

export enum KYCStatus {
    Pending,
    Passed,
    Rejected
}

export function buildRights(roles: Role[]): number {
    if (!roles) {
        return 0;
    }

    return roles.reduce((a, b) => {
        return a | b;
    }, 0);
}

export function getRolesFromRights(rights: number): Role[] {
    if (!rights) {
        return [];
    }

    const rolesKeys = Object.keys(Role);
    const roles: Role[] = rolesKeys.splice(0, rolesKeys.length / 2).map((value) => Number(value));

    return roles.filter((role) => rights & role);
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
    notifications: boolean;
    rights: number;
    status: UserStatus;
    kycStatus: KYCStatus;

    blockchainAccountAddress?: string;
    blockchainAccountSignedMessage?: string;
}

export interface IUser extends IUserProperties {
    organization: IPublicOrganization;
    emailConfirmed?: IEmailConfirmation['confirmed'];
}

export type UserRegisterReturnData = IUser;

export type UserLoginReturnData = { accessToken: string };

export type UserUpdateData = Partial<
    Pick<IUserProperties, 'blockchainAccountSignedMessage' | 'notifications'>
>;

export type UserStatusUpdate = Partial<Pick<IUserProperties, 'status' | 'kycStatus'>>;

export type UserPasswordUpdate = { oldPassword: string; newPassword: string };

export interface IUserFilter {
    orgName?: string;
    status?: UserStatus;
    kycStatus?: KYCStatus;
}

export type UpdateUserResponseReturnType = IUser;
