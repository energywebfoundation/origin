import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { CreateConnectionDTO } from '../dto/create-connection.dto';

export class CreateConnectionCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly credentials: CreateConnectionDTO
    ) {}
}
