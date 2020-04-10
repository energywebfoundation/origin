import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import fs from 'fs';
import path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import createConfig from './config/configuration';
import { Certificate } from './pods/certificate/certificate.entity';
import { CertificateModule } from './pods/certificate/certificate.module';
import { CertificationRequest } from './pods/certificate/certification-request.entity';
import { OwnershipCommitment } from './pods/certificate/ownership-commitment.entity';
import { Configuration } from './pods/configuration/configuration.entity';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { Device } from './pods/device/device.entity';
import { DeviceModule } from './pods/device/device.module';
import { FileModule } from './pods/file/file.module';
import { Organization } from './pods/organization/organization.entity';
import { OrganizationModule } from './pods/organization/organization.module';
import { OrganizationInvitation } from './pods/organization/organizationInvitation.entity';
import { User } from './pods/user/user.entity';
import { UserModule } from './pods/user/user.module';

const ENV_FILE_PATH = path.resolve(__dirname, '../../../../../.env');

const getDBConnectionOptions = (): PostgresConnectionOptions => {
    return process.env.DATABASE_URL
        ? {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              }
          }
        : {
              type: 'postgres',
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT) ?? 5432,
              username: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'origin'
          };
};

@Module({})
export class AppModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot({
                    envFilePath: fs.existsSync(ENV_FILE_PATH) ? ENV_FILE_PATH : null,
                    load: [createConfig],
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    ...getDBConnectionOptions(),
                    entities: [
                        OwnershipCommitment,
                        Configuration,
                        Device,
                        Organization,
                        User,
                        OrganizationInvitation,
                        CertificationRequest,
                        Certificate
                    ],
                    logging: ['info']
                }),
                FileModule,
                UserModule,
                ConfigurationModule,
                OrganizationModule,
                DeviceModule.register(smartMeterReadingsAdapter),
                AuthModule,
                CertificateModule.register(smartMeterReadingsAdapter)
            ],
            controllers: [AppController]
        };
    }
}
