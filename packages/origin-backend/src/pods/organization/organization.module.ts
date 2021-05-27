import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../file';

import { Handlers } from './handlers';
import { UserModule } from '../user';
import { OrganizationController } from './organization.controller';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization]),
        forwardRef(() => UserModule),
        FileModule,
        CqrsModule
    ],
    exports: [...Handlers, OrganizationService],
    providers: [...Handlers, OrganizationService],
    controllers: [OrganizationController]
})
export class OrganizationModule {}
