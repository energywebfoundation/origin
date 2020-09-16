import { Role } from '.';
import { isRole, IUser } from './User';

export interface ILoggedInUser {
    id: number;
    organizationId: number;
    email: string;
    blockchainAccountAddress: string;
    rights: number;
    hasRole(...role: Role[]): boolean;
    ownerId: string;
}

export class LoggedInUser implements ILoggedInUser {
    constructor(user: IUser) {
        this.id = user.id;
        this.organizationId = user.organization?.id;
        this.email = user.email;
        this.blockchainAccountAddress = user.blockchainAccountAddress;
        this.rights = user.rights;
    }

    id: number;

    organizationId: number;

    email: string;

    blockchainAccountAddress: string;

    rights: number;

    hasRole(...role: Role[]): boolean {
        return isRole(this, ...role);
    }

    get ownerId() {
        return (this.organizationId || this.id).toString();
    }
}
