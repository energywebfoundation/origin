import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent } from '@energyweb/origin-backend';
import { CreateOrganizationBeneficiaryCommand } from '@energyweb/origin-organization-irec-api';
import { Logger } from '@nestjs/common';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateIrecBeneficiaryHandler implements IEventHandler<OrganizationRegisteredEvent> {
    private readonly logger = new Logger(CreateIrecBeneficiaryHandler.name);

    constructor(private readonly commandBus: CommandBus) {}

    public async handle({ organization }: OrganizationRegisteredEvent): Promise<void> {
        this.logger.log(
            `Creating IREC beneficiary for organization "${organization.name}" id=${organization.id}`
        );
        await this.commandBus.execute(new CreateOrganizationBeneficiaryCommand(organization));
    }
}
