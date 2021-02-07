import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { CreateConnectionCommand } from '../commands/create-connection.command';
import { Connection } from '../connection.entity';
import { ConnectionDTO } from '../dto/connection.dto';
import { ConnectionCreatedEvent } from '../events/connection-created.event';
import { RegistrationService } from '../../registration';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly eventBus: EventBus
    ) {}

    async execute({
        user: { organizationId },
        credentials: { userName, password, clientId, clientSecret }
    }: CreateConnectionCommand): Promise<ConnectionDTO> {
        const client = new IRECAPIClient(process.env.IREC_API_URL);
        const loginResult = await client.login(userName, password, clientId, clientSecret);

        const [registration] = await this.registrationService.find(String(organizationId));
        if (!registration) {
            throw new BadRequestException('IREC Registration not found');
        }

        const connection = await this.repository.save({
            ...loginResult,
            registrationId: registration.id
        });

        this.eventBus.publish(new ConnectionCreatedEvent(connection, organizationId, registration));

        return ConnectionDTO.wrap(connection);
    }
}
