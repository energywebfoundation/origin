import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class GetConnectionsCommand {
    constructor(public readonly user: ILoggedInUser) {}
}
