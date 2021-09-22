import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent, UserService } from '@energyweb/origin-backend';
import { AccountService } from '@energyweb/exchange';
import { LoggedInUser } from '@energyweb/origin-backend-core';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateExchangeDepositAddressHandler
    implements IEventHandler<OrganizationRegisteredEvent>
{
    private readonly logger = new Logger(CreateExchangeDepositAddressHandler.name);

    constructor(
        private readonly userService: UserService,
        private readonly accountService: AccountService
    ) {}

    public async handle(event: OrganizationRegisteredEvent): Promise<void> {
        const user = new LoggedInUser(event.member);
        await this.accountService.create(user.ownerId);
        this.logger.log(
            `Exchange deposit address created for ${event.organization.name} (id=${event.organization.id})`
        );
    }
}
