import { OrganizationModule } from '@energyweb/origin-backend/dist/js/src/pods/organization/organization.module';
import { OrganizationService } from '@energyweb/origin-backend/dist/js/src/pods/organization/organization.service';
import { Module } from '@nestjs/common';
import { MailModule } from '../mail';
import { Handlers } from './handlers';

@Module({
    imports: [MailModule, OrganizationModule],
    providers: [OrganizationService, ...Handlers]
})
export class NotificationModule {}
