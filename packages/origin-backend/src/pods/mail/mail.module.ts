import { HandlebarsAdapter, MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailService } from './mail.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mandrillTransport = require('nodemailer-mandrill-transport');
@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => {
                return {
                    transport: mandrillTransport({
                        auth: {
                            apiKey: configService.get<string>('MANDRILL_API_KEY')
                        },
                        // eslint-disable-next-line camelcase
                        from_email: configService.get<string>('EMAIL_FROM'),
                        // eslint-disable-next-line camelcase
                        from_name: configService.get<string>('EMAIL_FROM_NAME'),
                        headers: {
                            'Reply-To': configService.get<string>('EMAIL_REPLY_TO')
                        },
                        merge: true,
                        tags: ['origin', 'no-reply']
                    }),
                    defaults: {
                        from: `"${configService.get<string>(
                            'EMAIL_FROM_NAME'
                        )}" <${configService.get<string>('EMAIL_FROM')}>`
                    },
                    template: {
                        dir: `${__dirname}/templates`,
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true
                        }
                    }
                };
            },
            inject: [ConfigService]
        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
