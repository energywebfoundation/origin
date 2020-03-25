import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './organization.entity';
import { OrganizationController } from './organization.controller';
import { UserModule } from '../user/user.module';
import { OrganizationInvitation } from './organizationInvitation.entity';
import { EventsModule } from '../events';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization, OrganizationInvitation]),
        UserModule,
        EventsModule
    ],
    providers: [],
    controllers: [OrganizationController]
})
export class OrganizationModule {}
