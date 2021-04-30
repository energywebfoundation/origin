import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationController } from './registration.controller';
import { Registration } from './registration.entity';
import { RegistrationService } from './registration.service';
import { Handlers } from './handlers';
import { IrecOrganizationService } from './irec-organization.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Registration]),
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigService
    ],
    providers: [...Handlers, RegistrationService, IrecOrganizationService],
    exports: [...Handlers, RegistrationService, IrecOrganizationService],
    controllers: [RegistrationController]
})
export class RegistrationModule {}
