import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from '../connection.entity';
import { RegistrationService } from '../../registration';
import { GetConnectionCommand, RefreshTokensCommand } from '../commands';

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensHandler implements ICommandHandler<RefreshTokensCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly commandBus: CommandBus
    ) {}

    async execute({ user, accessTokens }: RefreshTokensCommand): Promise<void> {
        const irecConnection = await this.commandBus.execute(new GetConnectionCommand(user));

        if (irecConnection) {
            await this.repository.update(irecConnection.id, accessTokens);
        }
    }
}
