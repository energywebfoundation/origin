import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './organization.entity';
import { OrganizationController } from './organization.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Organization])],
    providers: [],
    controllers: [OrganizationController]
})
export class OrganizationModule {}
