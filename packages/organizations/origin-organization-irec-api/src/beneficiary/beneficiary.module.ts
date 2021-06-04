import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@energyweb/origin-backend';

import { IrecModule, IrecService } from '../irec';
import { Beneficiary } from './beneficiary.entity';
import { BeneficiaryHandlers } from './handlers';
import { BeneficiaryController } from './beneficiary.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Beneficiary]),
        ConfigModule,
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        IrecModule,
        UserModule
    ],
    providers: [...BeneficiaryHandlers, IrecService],
    exports: [...BeneficiaryHandlers],
    controllers: [BeneficiaryController]
})
export class BeneficiaryModule {}
