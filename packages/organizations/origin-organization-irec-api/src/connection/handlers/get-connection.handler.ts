import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
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

    async execute({ user: { organizationId } }: GetConnectionCommand): Promise<ConnectionDTO> {
        const [registration] = await this.registrationService.find(String(organizationId));
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
