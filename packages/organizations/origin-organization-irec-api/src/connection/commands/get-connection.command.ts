import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class GetConnectionCommand {
    constructor(public readonly owner: ILoggedInUser | string | number) {}
}
