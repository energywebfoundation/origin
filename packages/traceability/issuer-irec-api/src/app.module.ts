import path from 'path';
import fs from 'fs';
import { Module, ValidationPipe } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import {
    AppModule as OriginBackendModule,
    FileModule,
    UserModule
} from '@energyweb/origin-backend';
import { IssuerModule } from '@energyweb/issuer-api';
import { CertificationRequestModule } from './pods/certification-request';

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }, IntUnitsOfEnergy];

const getEnvFilePath = () => {
    const pathsToTest = ['../../../../../.env', '../../../../../../.env'];

    let finalPath = null;

    for (const pathToTest of pathsToTest) {
        const resolvedPath = path.resolve(__dirname, pathToTest);

        if (__dirname.includes('dist/js') && fs.existsSync(resolvedPath)) {
            finalPath = resolvedPath;
            break;
        }
    }

    return finalPath;
};

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: getEnvFilePath(),
            isGlobal: true
        }),
        ScheduleModule.forRoot(),
        OriginBackendModule,
        UserModule,
        FileModule,
        IssuerModule.register({ enableCertificationRequest: false }),
        CertificationRequestModule
    ],
    providers
})
export class AppModule {}
