import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import createConfig from './config/configuration';
import { AdminModule } from './pods/admin/admin.module';
import { CertificateModule } from './pods/certificate/certificate.module';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { DeviceModule } from './pods/device/device.module';
import { FileModule } from './pods/file/file.module';
import { OrganizationModule } from './pods/organization/organization.module';
import { UserModule } from './pods/user/user.module';
import { EmailConfirmationModule } from './pods/email-confirmation/email-confirmation.module';
import { providers } from '.';
import { CertificationRequestModule } from './pods/certification-request/certification-request.module';

const ENV_FILE_PATH = path.resolve(__dirname, '../../../../../.env');

@Module({})
export class AppModule {
    static register(
        smartMeterReadingsAdapter: ISmartMeterReadingsAdapter,
        enabledFeatures: OriginFeature[] = allOriginFeatures
    ): DynamicModule {
        const certificatesEnabled = enabledFeatures.includes(OriginFeature.Certificates);
        const certificationRequestEnabled =
            certificatesEnabled && enabledFeatures.includes(OriginFeature.CertificationRequests);

        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot({
                    envFilePath: fs.existsSync(ENV_FILE_PATH) ? ENV_FILE_PATH : null,
                    load: [createConfig],
                    isGlobal: true
                }),
                FileModule,
                AuthModule,
                UserModule,
                ConfigurationModule,
                OrganizationModule,
                AdminModule,
                EmailConfirmationModule,
                ...(certificatesEnabled ? [CertificateModule] : []),
                ...(certificationRequestEnabled
                    ? [CertificationRequestModule.register(smartMeterReadingsAdapter)]
                    : []),
                ...(enabledFeatures.includes(OriginFeature.Devices)
                    ? [DeviceModule.register(smartMeterReadingsAdapter)]
                    : [])
            ],
            controllers: [AppController],
            providers
        };
    }
}
