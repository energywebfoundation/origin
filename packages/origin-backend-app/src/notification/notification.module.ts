import { OrganizationModule, UserModule } from '@energyweb/origin-backend';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { MailModule } from '../mail';
import { Handlers } from './handlers';

@Module({
    imports: [MailModule, OrganizationModule, UserModule, CqrsModule],
    providers: [...Handlers]
})
export class NotificationModule {}
