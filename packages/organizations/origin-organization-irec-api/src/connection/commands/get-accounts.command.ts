import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class GetAccountsCommand {
    constructor(public readonly owner: ILoggedInUser | string | number) {}
}
