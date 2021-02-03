import { HandlebarsAdapter, MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MandrillTransport } from 'mandrill-nodemailer-transport';

import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => {
                return {
                    transport: new MandrillTransport({
                        apiKey: configService.get<string>('MANDRILL_API_KEY')
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
