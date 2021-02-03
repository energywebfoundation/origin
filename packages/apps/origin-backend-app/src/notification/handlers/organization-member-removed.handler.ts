import { OrganizationMemberRemovedEvent } from '@energyweb/origin-backend';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailService } from '../../mail';

@EventsHandler(OrganizationMemberRemovedEvent)
export class OrganizationMemberRemovedHandler
    implements IEventHandler<OrganizationMemberRemovedEvent> {
    private readonly logger = new Logger(OrganizationMemberRemovedHandler.name);

    constructor(private readonly mailService: MailService) {}

    public async handle(event: OrganizationMemberRemovedEvent): Promise<void> {
        const { organization, member } = event;

        const result = await this.mailService.send({
            to: member.email,
            subject: `[Origin] You have been removed from an organization`,
            html: `You have been removed from ${organization.name} organization.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${member.email}.`);
        }
    }
}
