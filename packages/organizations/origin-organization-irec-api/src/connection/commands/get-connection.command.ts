import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class GetConnectionCommand {
    constructor(public readonly user: ILoggedInUser) {}
}
