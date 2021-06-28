import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { CreateConnectionDTO } from '../../irec';

export class CreateConnectionCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly credentials: CreateConnectionDTO
    ) {}
}
