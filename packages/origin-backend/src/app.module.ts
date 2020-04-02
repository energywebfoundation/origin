import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import fs from 'fs';
import path from 'path';
import { ConnectionOptions } from 'typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import createConfig from './config/configuration';
import { EventsModule } from './pods/events';
import { CertificateModule } from './pods/certificate/certificate.module';
import { CertificationRequest } from './pods/certificate/certification-request.entity';
import { Configuration } from './pods/configuration/configuration.entity';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { Device } from './pods/device/device.entity';
import { DeviceModule } from './pods/device/device.module';
import { FileModule } from './pods/file/file.module';
import { OwnershipCommitment } from './pods/certificate/ownership-commitment.entity';
import { Organization } from './pods/organization/organization.entity';
import { OrganizationModule } from './pods/organization/organization.module';
import { OrganizationInvitation } from './pods/organization/organizationInvitation.entity';
import { User } from './pods/user/user.entity';
import { UserModule } from './pods/user/user.module';
import { Certificate } from './pods/certificate/certificate.entity';

const ENV_FILE_PATH = path.resolve(__dirname, '../../../../../.env');

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
                TypeOrmModule.forRootAsync({
                    useFactory: async (configService: ConfigService) => ({
                        ...configService.get<ConnectionOptions>('ORM'),
                        entities: [
                            OwnershipCommitment,
                            Configuration,
                            Device,
                            Organization,
                            User,
                            OrganizationInvitation,
                            CertificationRequest,
                            Certificate
                        ]
                    }),
                    inject: [ConfigService]
                }),
                FileModule,
                UserModule,
                ConfigurationModule,
                OrganizationModule,
                DeviceModule.register(smartMeterReadingsAdapter),
                AuthModule,
                EventsModule,
                CertificateModule.register(smartMeterReadingsAdapter)
            ],
            controllers: [AppController]
        };
    }
}
