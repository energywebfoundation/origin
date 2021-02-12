import { EmailConfirmationRequestedEvent } from '@energyweb/origin-backend';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailService } from '../../mail';

@EventsHandler(EmailConfirmationRequestedEvent)
export class EmailConfirmationRequestedHandler
    implements IEventHandler<EmailConfirmationRequestedEvent> {
    private readonly logger = new Logger(EmailConfirmationRequestedHandler.name);

    constructor(private readonly mailService: MailService) {}

    public async handle(event: EmailConfirmationRequestedEvent): Promise<void> {
        const { email, token } = event;

        const url = `${process.env.UI_BASE_URL}/account/confirm-email?token=${token}`;

        const result = await this.mailService.send({
            to: email,
            subject: `[Origin] Confirm your email address`,
            html: `Welcome to the marketplace! Please click the link below to verify your email address: <br/> <br/> <a href="${url}">${url}</a>.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${email}.`);
        }
    }
}
