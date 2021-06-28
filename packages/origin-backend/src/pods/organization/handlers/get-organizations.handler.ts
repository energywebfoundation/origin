import { In } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OrganizationService } from '../organization.service';
import { Organization } from '../organization.entity';
import { GetOrganizationsCommand } from '../commands';

@CommandHandler(GetOrganizationsCommand)
export class GetOrganizationsHandler implements ICommandHandler<GetOrganizationsCommand> {
    constructor(private readonly organizationService: OrganizationService) {}

    async execute({ query: { ids } }: GetOrganizationsCommand): Promise<Organization[]> {
        return this.organizationService.find({
            ...(ids ? { id: In(ids) } : {})
        });
    }
}
