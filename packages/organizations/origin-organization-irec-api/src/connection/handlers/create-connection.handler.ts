import { Repository } from 'typeorm';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject } from '@nestjs/common';

import { RegistrationService } from '../../registration';
import { IREC_SERVICE, IrecService } from '../../irec';
import { CreateConnectionCommand } from '../commands';
import { ConnectionDTO } from '../dto';
import { ConnectionCreatedEvent } from '../events';
import { Connection } from '../connection.entity';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly eventBus: EventBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({
        user: { ownerId, organizationId },
        credentials: { userName, password, clientId, clientSecret }
    }: CreateConnectionCommand): Promise<ConnectionDTO> {
        const loginResult = await this.irecService.login({
            userName,
            password,
            clientId,
            clientSecret
        });

        const [registration] = await this.registrationService.find(
            String(ownerId || organizationId)
        );
        if (!registration) {
            throw new BadRequestException('IREC Registration not found');
        }

        const connection = await this.repository.save({
            ...loginResult,
            userName,
            registration
        });

        this.eventBus.publish(new ConnectionCreatedEvent(connection, organizationId, registration));

        return ConnectionDTO.wrap(connection);
    }
}
