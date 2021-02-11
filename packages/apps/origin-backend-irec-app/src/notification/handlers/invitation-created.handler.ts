import { InvitationCreatedEvent } from '@energyweb/origin-backend';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailService } from '../../mail';

@EventsHandler(InvitationCreatedEvent)
export class InvitationCreatedHandler implements IEventHandler<InvitationCreatedEvent> {
    private readonly logger = new Logger(InvitationCreatedHandler.name);

    constructor(private readonly mailService: MailService) {}

    public async handle(event: InvitationCreatedEvent): Promise<void> {
        const { organization, email } = event;

        const url = `${process.env.UI_BASE_URL}/organization/organization-invitations`;

        const result = await this.mailService.send({
            to: email,
            subject: `[Origin] Organization invitation`,
            html: `Organization ${organization.name} has invited you to join. To accept the invitation, please visit <a href="${url}">${url}</a>`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${email}.`);
        }
    }
}
