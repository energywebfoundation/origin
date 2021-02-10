import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'mandrill-nodemailer-transport';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) {}

    async send(sendMailOptions: ISendMailOptions) {
        try {
            const result: SentMessageInfo = await this.mailerService.sendMail({
                from: {
                    name: this.configService.get<string>('EMAIL_FROM_NAME'),
                    address: this.configService.get<string>('EMAIL_FROM')
                },
                replyTo: this.configService.get<string>('EMAIL_REPLY_TO'),
                ...sendMailOptions
            });

            const allSucceeded = result?.response.every((m) =>
                ['sent', 'queued', 'scheduled'].includes(m.status)
            );

            if (allSucceeded) {
                this.logger.log(`Sent email with id: ${result.messageId}.`);
                this.logger.log(JSON.stringify(result.response));
                return true;
            }

            this.logger.error(`Error when sending email.`);
            this.logger.error(JSON.stringify(result.response));

            return false;
        } catch (error) {
            this.logger.error(`Error when sending email.`);
            this.logger.error(JSON.stringify(error));
        }

        return false;
    }
}
