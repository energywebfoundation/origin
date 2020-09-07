import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification';
import { UserModule } from '../user/user.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Organization]), UserModule, NotificationModule],
    providers: [OrganizationService],
    controllers: [OrganizationController],
    exports: [OrganizationService]
})
export class OrganizationModule {}
