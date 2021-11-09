import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent, UserService } from '@energyweb/origin-backend';
import { AccountService } from '@energyweb/exchange';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateExchangeDepositAddressHandler
    implements IEventHandler<OrganizationRegisteredEvent>
{
    private readonly logger = new Logger(CreateExchangeDepositAddressHandler.name);

    constructor(
        private readonly userService: UserService,
        private readonly accountService: AccountService
    ) {}

    public async handle({ organization }: OrganizationRegisteredEvent): Promise<void> {
        this.logger.log(
            `Creating exchange deposit address for "${organization.name}" (id=${organization.id})`
        );
        await this.accountService.create(String(organization.id));
    }
}
