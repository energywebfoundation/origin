import { Role } from '.';
import { isRole, IUserWithRelationsIds } from './User';

export interface ILoggedInUser {
    id: number;
    organizationId?: number;
    email: string;
    blockchainAccountAddress: string;
    rights: number;
    hasRole(role: Role): boolean;
    ownerId: number;
}

export class LoggedInUser implements ILoggedInUser {
    constructor(user: IUserWithRelationsIds) {
        this.id = user.id;
        this.organizationId = user.organization;
        this.email = user.email;
        this.blockchainAccountAddress = user.blockchainAccountAddress;
        this.rights = user.rights;
    }

    id: number;

    organizationId: number;

    email: string;

    blockchainAccountAddress: string;

    rights: number;

    hasRole(role: Role): boolean {
        return isRole(this, role);
    }

    get ownerId() {
        return this.organizationId ?? this.id;
    }
}
