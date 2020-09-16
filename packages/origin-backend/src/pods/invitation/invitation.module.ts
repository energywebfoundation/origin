import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification';
import { InvitationController } from './invitation.controller';
import { UserModule } from '../user/user.module';
import { Invitation } from './invitation.entity';
import { InvitationService } from './invitation.service';
import { OrganizationModule } from '../organization/organization.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invitation]),
        UserModule,
        NotificationModule,
        OrganizationModule
    ],
    providers: [InvitationService],
    controllers: [InvitationController]
})
export class InvitationModule {}
