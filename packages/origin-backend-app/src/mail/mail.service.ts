import { Injectable, Logger } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface IIndividualMandrillMailSendStatus {
    email: string;
    status: 'sent';
    _id: string;
    // eslint-disable-next-line camelcase
    reject_reason: string;
}

interface IMandrillMailSendStatus {
    messageId: string;
    accepted: IIndividualMandrillMailSendStatus[];
    rejected: IIndividualMandrillMailSendStatus[];
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) {}

    async send(sendMailOptions: ISendMailOptions) {
        try {
            const result: IMandrillMailSendStatus = await this.mailerService.sendMail({
                from: {
                    name: this.configService.get<string>('EMAIL_FROM_NAME'),
                    address: this.configService.get<string>('EMAIL_FROM')
                },
                replyTo: this.configService.get<string>('EMAIL_REPLY_TO'),
                ...sendMailOptions
            });

            return !!result.messageId;
        } catch (error) {
            this.logger.error(`Error when sending email.`);
            this.logger.error(error);
        }

        return false;
    }
}
