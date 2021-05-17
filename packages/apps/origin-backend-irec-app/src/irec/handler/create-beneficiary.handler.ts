import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
    OrganizationRegisteredEvent,
    OrganizationService,
    UserService
} from '@energyweb/origin-backend';
import { IrecService } from '../irec.service';

@EventsHandler(OrganizationRegisteredEvent)
export class CreateBeneficiaryHandler implements IEventHandler<OrganizationRegisteredEvent> {
    constructor(
        private readonly userService: UserService,
        private readonly irecService: IrecService,
        private readonly organizationService: OrganizationService
    ) {}

    public async handle({ organization }: OrganizationRegisteredEvent): Promise<void> {
        const platformAdmin = await this.userService.getPlatformAdmin();

        const beneficiary = await this.irecService.createBeneficiary(
            platformAdmin.id,
            organization
        );

        this.organizationService.updateBeneficiaryId(organization.id, String(beneficiary.id));
    }
}
