import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { CreateConnectionCommand } from '../commands/create-connection.command';
import { Connection } from '../connection.entity';
import { ConnectionDTO } from '../dto/connection.dto';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>
    ) {}

    async execute({
        credentials: { userName, password, clientId, clientSecret }
    }: CreateConnectionCommand): Promise<ConnectionDTO> {
        const client = new IRECAPIClient(process.env.IREC_API_URL);
        const loginResult = await client.login(userName, password, clientId, clientSecret);

        const connection = await this.repository.save(loginResult as Connection);

        return ConnectionDTO.wrap(connection);
    }
}
