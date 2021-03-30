import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationController } from './registration.controller';
import { Registration } from './registration.entity';
import { RegistrationService } from './registration.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Registration]),
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' })
    ],
    providers: [RegistrationService],
    exports: [RegistrationService],
    controllers: [RegistrationController]
})
export class RegistrationModule {}
