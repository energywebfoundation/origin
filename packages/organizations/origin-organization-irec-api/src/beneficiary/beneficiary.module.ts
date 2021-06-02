import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';

import { Beneficiary } from './beneficiary.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Beneficiary]),
        ConfigModule,
        CqrsModule,
        PassportModule.register({ defaultStrategy: 'jwt' })
    ],
    providers: [],
    exports: [],
    controllers: []
})
export class BeneficiaryModule {}
