import { Role } from '.';
import { isRole, IUser } from './User';

export interface ILoggedInUser {
    id: number;
    organizationId: number;
    did: string;
    email: string;
    blockchainAccountAddress: string;
    rights: number;
    hasRole(...role: Role[]): boolean;
    ownerId: string;
    hasOrganization: boolean;
}

export class LoggedInUser implements ILoggedInUser {
    constructor(user: IUser) {
        this.id = user.id;
        this.organizationId = user.organization?.id;
        this.did = user?.did;
        this.email = user.email;
        this.blockchainAccountAddress = user.organization?.blockchainAccountAddress;
        this.rights = user.rights;
    }

    id: number;

    organizationId: number;

    did: string;

    email: string;

    blockchainAccountAddress: string;

    rights: number;

    hasRole(...role: Role[]): boolean {
        return isRole(this, ...role);
    }

    get ownerId(): string {
        return (this.organizationId ?? this.id).toString();
    }

    get hasOrganization(): boolean {
        return !!this.organizationId;
    }
}
