import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { Repository } from 'typeorm';
import { Connection } from '../connection.entity';
import { ConnectionDTO } from '../dto';
import { RegistrationService } from '../../registration';
import { GetConnectionCommand } from '../commands';

@CommandHandler(GetConnectionCommand)
export class GetConnectionHandler implements ICommandHandler<GetConnectionCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService
    ) {}

    async execute({ owner }: GetConnectionCommand): Promise<ConnectionDTO> {
        const ownerId =
            typeof owner === 'string' || typeof owner === 'number'
                ? owner
                : (owner as ILoggedInUser).organizationId ??
                  (owner as ILoggedInUser).ownerId ??
                  (owner as ILoggedInUser).id;

        const [registration] = await this.registrationService.find(String(ownerId));
        if (!registration) {
            return undefined;
        }
        const connections = await this.repository.findOne({
            where: { registration: registration.id },
            relations: ['registration']
        });

        return ConnectionDTO.wrap(connections);
    }
}
