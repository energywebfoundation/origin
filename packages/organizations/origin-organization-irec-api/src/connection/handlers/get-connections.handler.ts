import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from '../connection.entity';
import { ConnectionDTO } from '../dto/connection.dto';
import { RegistrationService } from '../../registration';
import { GetConnectionsCommand } from '../commands';

@CommandHandler(GetConnectionsCommand)
export class GetConnectionHandler implements ICommandHandler<GetConnectionsCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService
    ) {}

    async execute({ user: { organizationId } }: GetConnectionsCommand): Promise<ConnectionDTO[]> {
        const [registration] = await this.registrationService.find(String(organizationId));
        if (!registration) {
            return [];
        }
        const connections = await this.repository.find({
            where: { registrationId: registration.id }
        });

        return connections.map((c) => ConnectionDTO.wrap(c));
    }
}
