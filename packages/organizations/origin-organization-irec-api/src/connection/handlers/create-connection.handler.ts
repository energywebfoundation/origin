import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreateConnectionCommand } from '../commands';
import { ConnectionDTO } from '../dto';
import { ConnectionCreatedEvent } from '../events';
import { Connection } from '../connection.entity';
import { RegistrationService } from '../../registration';
import { IrecConnectionService } from '../irec-connection.service';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly eventBus: EventBus,
        private readonly irecConnectionService: IrecConnectionService
    ) {}

    async execute({
        user: { organizationId },
        credentials: { userName, password, clientId, clientSecret }
    }: CreateConnectionCommand): Promise<ConnectionDTO> {
        const loginResult = await this.irecConnectionService.login({
            userName,
            password,
            clientId,
            clientSecret
        });

        const [registration] = await this.registrationService.find(String(organizationId));
        if (!registration) {
            throw new BadRequestException('IREC Registration not found');
        }

        const connection = await this.repository.save({
            ...loginResult,
            registration
        });

        this.eventBus.publish(new ConnectionCreatedEvent(connection, organizationId, registration));

        return ConnectionDTO.wrap(connection);
    }
}
