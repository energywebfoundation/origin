import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Connection } from '../connection.entity';
import { RegistrationService } from '../../registration';
import { GetAccountsCommand } from '../commands';
import { IREC_SERVICE, IrecService } from '../../irec';
import { AccountDTO } from '../dto';

@CommandHandler(GetAccountsCommand)
export class GetAccountsHandler implements ICommandHandler<GetAccountsCommand> {
    constructor(
        @InjectRepository(Connection)
        private readonly repository: Repository<Connection>,
        private readonly registrationService: RegistrationService,
        private readonly commandBus: CommandBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService
    ) {}

    async execute({ owner }: GetAccountsCommand): Promise<AccountDTO[]> {
        return this.irecService.getAccountInfo(owner);
    }
}
