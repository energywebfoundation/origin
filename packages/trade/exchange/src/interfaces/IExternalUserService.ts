import { IUser } from '@energyweb/origin-backend-core';

export const IExternalUserService = Symbol('IExternalUserService');
export interface IExternalUserService {
    getPlatformAdmin(): Promise<IUser>;
}
