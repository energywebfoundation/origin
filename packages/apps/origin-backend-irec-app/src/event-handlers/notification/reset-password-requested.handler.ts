import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordRequestedEvent } from '@energyweb/origin-backend';

import { MailService } from '../../mail';

@EventsHandler(ResetPasswordRequestedEvent)
export class ResetPasswordRequestedHandler implements IEventHandler<ResetPasswordRequestedEvent> {
    private readonly logger = new Logger(ResetPasswordRequestedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly configService: ConfigService
    ) {}

    public async handle(event: ResetPasswordRequestedEvent): Promise<void> {
        const { email, token } = event;

        const host = this.configService.get<string>('UI_BASE_URL');
        const url = `${host}/login/reset-password?token=${token}`;

        const result = await this.mailService.send({
            to: email,
            subject: `[Origin] Password reset requested`,
            html:
                `Request for resetting your password was submitted.` +
                `\nTo reset your password follow the URL (valid for 12 hours):` +
                `${url}\nIf you didn't request resetting password ignore this message.`
        });

        if (result) {
            this.logger.log(`Reset password email notification email sent to ${email}.`);
        }
    }
}
