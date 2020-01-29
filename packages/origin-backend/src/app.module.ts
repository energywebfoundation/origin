import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';
import fs from 'fs';
import path from 'path';

import { JsonEntity } from './pods/json-entity/json-entity.entity';
import { MarketContractLookup } from './pods/contracts-storage/market-contract-lookup.entity';
import { Currency } from './pods/currency/currency.entity';
import { Compliance } from './pods/compliance/compliance.entity';
import { Organization } from './pods/organization/organization.entity';
import { User } from './pods/user/user.entity';
import { Device } from './pods/device/device.entity';
import { Demand } from './pods/demand/demand.entity';

import { UserModule } from './pods/user/user.module';
import { ComplianceModule } from './pods/compliance/compliance.module';
import createConfig from './config/configuration';
import { Country } from './pods/country/country.entity';
import { CountryModule } from './pods/country/country.module';
import { CurrencyModule } from './pods/currency/currency.module';
import { ImageModule } from './pods/image/image.module';
import { JsonEntityModule } from './pods/json-entity/json-entity.module';
import { ContractsStorageModule } from './pods/contracts-storage/contracts-storage.module';
import { OrganizationModule } from './pods/organization/organization.module';
import { DeviceModule } from './pods/device/device.module';
import { DemandModule } from './pods/demand/demand.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { OrganizationInvitation } from './pods/organization/organizationInvitation.entity';

const ENV_FILE_PATH = path.resolve(__dirname, '../../../../../.env');

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: fs.existsSync(ENV_FILE_PATH) ? ENV_FILE_PATH : null,
            load: [createConfig],
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                ...configService.get<ConnectionOptions>('ORM'),
                entities: [
                    JsonEntity,
                    MarketContractLookup,
                    Currency,
                    Compliance,
                    Country,
                    Device,
                    Demand,
                    Organization,
                    User,
                    OrganizationInvitation
                ]
            }),
            inject: [ConfigService]
        }),
        ImageModule,
        UserModule,
        ComplianceModule,
        CountryModule,
        CurrencyModule,
        JsonEntityModule,
        ContractsStorageModule,
        OrganizationModule,
        DeviceModule,
        DemandModule,
        AuthModule
    ],
    controllers: [AppController],
    providers: []
})
export class AppModule {}
