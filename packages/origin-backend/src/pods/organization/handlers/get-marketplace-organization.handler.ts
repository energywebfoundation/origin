import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IPublicOrganization } from '@energyweb/origin-backend-core';

import { UserService } from '../../user';
import { GetMarketplaceOrganizationCommand } from '../commands';

@CommandHandler(GetMarketplaceOrganizationCommand)
export class GetMarketplaceOrganizationHandler
    implements ICommandHandler<GetMarketplaceOrganizationCommand>
{
    constructor(private readonly userService: UserService) {}

    async execute(): Promise<IPublicOrganization> {
        const platformAdmin = await this.userService.getPlatformAdmin();
        return platformAdmin.organization;
    }
}
