import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetOrganizationCommand } from '../commands';
import { OrganizationService } from '../organization.service';
import { Organization } from '../organization.entity';

@CommandHandler(GetOrganizationCommand)
export class GetOrganizationHandler implements ICommandHandler<GetOrganizationCommand> {
    constructor(private readonly organizationService: OrganizationService) {}

    async execute({ id }: GetOrganizationCommand): Promise<Organization> {
        return this.organizationService.findOne(id);
    }
}
