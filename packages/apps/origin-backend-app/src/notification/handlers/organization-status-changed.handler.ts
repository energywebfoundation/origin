import { OrganizationStatusChangedEvent } from '@energyweb/origin-backend';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailService } from '../../mail';

@EventsHandler(OrganizationStatusChangedEvent)
export class OrganizationStatusChangedHandler
    implements IEventHandler<OrganizationStatusChangedEvent> {
    private readonly logger = new Logger(OrganizationStatusChangedHandler.name);

    constructor(private readonly mailService: MailService) {}

    public async handle(event: OrganizationStatusChangedEvent): Promise<void> {
        const { organization, status } = event;

        const url = `${process.env.UI_BASE_URL}/organization/organization-view/${organization.id}`;
        const result = await this.mailService.send({
            to: organization.signatoryEmail,
            subject: `[Origin] Update on the registration process`,
            html: `Status of your registration changed to ${status}. To find out more please visit <a href="${url}">${url}</a>`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${organization.signatoryEmail}.`);
        }
    }
}
