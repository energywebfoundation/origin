import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../file';

import { Handlers } from './handlers';
import { UserModule } from '../user/user.module';
import { OrganizationController } from './organization.controller';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization]),
        forwardRef(() => UserModule),
        FileModule,
        CqrsModule,
        ConfigModule
    ],
    exports: [...Handlers, OrganizationService],
    providers: [...Handlers, OrganizationService],
    controllers: [OrganizationController]
})
export class OrganizationModule {}
