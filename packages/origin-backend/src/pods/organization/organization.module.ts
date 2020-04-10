import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './organization.entity';
import { OrganizationController } from './organization.controller';
import { UserModule } from '../user/user.module';
import { OrganizationInvitation } from './organizationInvitation.entity';
import { OrganizationService } from './organization.service';
import { NotificationModule } from '../notification';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization, OrganizationInvitation]),
        UserModule,
        NotificationModule
    ],
    providers: [OrganizationService],
    controllers: [OrganizationController],
    exports: [OrganizationService]
})
export class OrganizationModule {}
