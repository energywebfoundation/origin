import { Role } from '@energyweb/user-registry';
import { IUserWithRelations } from '@energyweb/origin-backend-core';

// @TODO implement proper role check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isRole(userOffchain: IUserWithRelations, role: Role) {
    if (!userOffchain) {
        return false;
    }

    if (role === Role.Issuer) {
        return false;
    }

    return true;
}
