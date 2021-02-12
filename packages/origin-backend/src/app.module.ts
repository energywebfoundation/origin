import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import fs from 'fs';
import path from 'path';

import { providers } from '.';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import createConfig from './config/configuration';
import { AdminModule } from './pods/admin/admin.module';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { EmailConfirmationModule } from './pods/email-confirmation/email-confirmation.module';
import { FileModule } from './pods/file/file.module';
import { InvitationModule } from './pods/invitation/invitation.module';
import { OrganizationModule } from './pods/organization/organization.module';
import { UserModule } from './pods/user/user.module';

const ENV_FILE_PATH = path.resolve(__dirname, '../../../.env');

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: fs.existsSync(ENV_FILE_PATH) ? ENV_FILE_PATH : null,
            load: [createConfig],
            isGlobal: true
        }),
        FileModule,
        UserModule,
        ConfigurationModule,
        OrganizationModule,
        InvitationModule,
        AuthModule,
        AdminModule,
        EmailConfirmationModule
    ],
    controllers: [AppController],
    providers
})
export class AppModule {}
