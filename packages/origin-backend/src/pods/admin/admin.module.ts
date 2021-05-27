import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AdminController } from './admin.controller';

import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UserModule, OrganizationModule],
    controllers: [AdminController]
})
export class AdminModule {}
