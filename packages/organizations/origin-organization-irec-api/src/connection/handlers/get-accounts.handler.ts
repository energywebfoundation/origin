import { Repository } from 'typeorm';
import { HttpStatus, Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Connection } from '../connection.entity';
import { RegistrationService } from '../../registration';
import { GetAccountsCommand } from '../commands';
import { IREC_SERVICE, IrecService } from '../../irec';
import { AccountDTO } from '../dto';
import { HttpException } from '@nestjs/common';

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
        try {
            return await this.irecService.getAccountInfo(owner);
        } catch (e) {
            if (e instanceof HttpException) {
                const status = e.getStatus();
                if (status === HttpStatus.FORBIDDEN) {
                    // Registrant account does not have permissions to get list of accounts
                    // so we return empty list
                    return [];
                }
            }
            throw e;
        }
    }
}
