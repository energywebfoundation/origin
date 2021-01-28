import { CreateConnectionDTO } from '../dto/create-connection.dto';

export class CreateConnectionCommand {
    constructor(public readonly credentials: CreateConnectionDTO) {}
}
