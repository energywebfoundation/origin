import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent, UserService } from '@energyweb/origin-backend';
import { IrecOrganizationService } from '../irec-organization.service';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateBeneficiaryHandler implements IEventHandler<OrganizationRegisteredEvent> {
    constructor(
        private readonly userService: UserService,
        private readonly irecOrganizationService: IrecOrganizationService
    ) {}

    public async handle({ organization }: OrganizationRegisteredEvent): Promise<void> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        await this.irecOrganizationService.createBeneficiary(platformAdmin.id, organization);
    }
}
