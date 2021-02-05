import { OrganizationMemberRoleChangedEvent } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(OrganizationMemberRoleChangedEvent)
export class OrganizationMemberRoleChangedHandler
    implements IEventHandler<OrganizationMemberRoleChangedEvent> {
    private readonly logger = new Logger(OrganizationMemberRoleChangedHandler.name);

    constructor(private readonly mailService: MailService) {}

    public async handle(event: OrganizationMemberRoleChangedEvent): Promise<void> {
        const { organization, member, role } = event;

        const url = `${process.env.UI_BASE_URL}/account/user-profile`;

        const result = await this.mailService.send({
            to: member.email,
            subject: `[Origin] Organization role update`,
            html: `The administrator of ${organization.name} changed your role to ${Role[role]}. Visit <a href="${url}">${url}</a> to see the details.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${member.email}.`);
        }
    }
}
