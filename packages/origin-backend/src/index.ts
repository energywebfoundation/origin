import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './pods/admin';
import { Configuration, ConfigurationModule } from './pods/configuration';
import { EmailConfirmation, EmailConfirmationModule } from './pods/email-confirmation';
import { File, FileModule } from './pods/file';
import { Invitation, InvitationModule } from './pods/invitation';
import { Organization, OrganizationModule } from './pods/organization';
import { User, UserModule } from './pods/user';

export { AppModule } from './app.module';

export * from './pods/configuration';
export * from './pods/email-confirmation/events';
export * from './pods/invitation/events';
export * from './pods/file';
export * from './pods/organization';
export * from './pods/user';

export const entities = [Configuration, Organization, User, Invitation, EmailConfirmation, File];

export const modules = [
    AuthModule,
    AdminModule,
    ConfigurationModule,
    FileModule,
    OrganizationModule,
    UserModule,
    EmailConfirmationModule,
    InvitationModule
];

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }];
