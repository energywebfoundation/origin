import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent } from '@energyweb/origin-backend';
import { CreateBeneficiaryCommand } from '@energyweb/origin-organization-irec-api';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateIrecBeneficiaryHandler implements IEventHandler<OrganizationRegisteredEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    public async handle({ organization }: OrganizationRegisteredEvent): Promise<void> {
        await this.commandBus.execute(new CreateBeneficiaryCommand(organization));
    }
}
