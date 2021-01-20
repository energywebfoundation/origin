import { IBlockchainAccount, Role } from '.';
import { isRole, IUser } from './User';

export interface ILoggedInUser {
    id: number;
    organizationId: number;
    email: string;
    blockchainAccounts: IBlockchainAccount[];
    rights: number;
    hasRole(...role: Role[]): boolean;
    ownerId: string;
    hasOrganization: boolean;
}

export class LoggedInUser implements ILoggedInUser {
    constructor(user: IUser) {
        this.id = user.id;
        this.organizationId = user.organization?.id;
        this.email = user.email;
        this.blockchainAccounts = user.blockchainAccounts;
        this.rights = user.rights;
    }

    id: number;

    organizationId: number;

    email: string;

    blockchainAccounts: IBlockchainAccount[];

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
