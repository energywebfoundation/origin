import path from 'path';
import fs from 'fs';
import { Module, DynamicModule } from '@nestjs/common';

import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ConfigModule } from '@nestjs/config';
import { CertificateModule } from './pods/certificate';
import { BlockchainPropertiesModule } from './pods/blockchain';
import { CertificationRequestModule } from './pods/certification-request';
import { ISSUER_MODULE_OPTIONS_TOKEN } from './const';
import { IssuerModuleOptions } from './types';

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

export const providers = [IntUnitsOfEnergy];

@Module({})
export class IssuerModule {
    static register(originalOptions: Partial<IssuerModuleOptions> = {}): DynamicModule {
        const defaultOptions: IssuerModuleOptions = {
            enableTransactionLogging: false,
            enableCertificationRequest: true
        };

        const options = Object.assign(defaultOptions, originalOptions);

        return {
            module: IssuerModule,
            imports: [
                ConfigModule.forRoot({
                    envFilePath: getEnvFilePath(),
                    isGlobal: true
                }),
                CertificateModule,
                BlockchainPropertiesModule,
                ...(options.enableCertificationRequest ? [CertificationRequestModule] : [])
            ],
            providers: [
                ...providers,
                {
                    provide: ISSUER_MODULE_OPTIONS_TOKEN,
                    useValue: options
                }
            ]
        };
    }
}
