import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { OrganizationController } from './organization.controller';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';

@Module({
    imports: [TypeOrmModule.forFeature([Organization]), UserModule, CqrsModule],
    providers: [OrganizationService],
    controllers: [OrganizationController],
    exports: [OrganizationService]
})
export class OrganizationModule {}
