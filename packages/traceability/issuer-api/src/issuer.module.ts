import path from 'path';
import fs from 'fs';
import { Module, DynamicModule } from '@nestjs/common';

import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { ConfigModule } from '@nestjs/config';
import { CertificateModule } from './pods/certificate';
import { BlockchainPropertiesModule } from './pods/blockchain';
import { CertificationRequestModule } from './pods/certification-request';
import { IssuerModuleOptions, IssuerModuleInputOptions, OptionsModule } from './pods/options';

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
    static register(originalOptions: IssuerModuleInputOptions): DynamicModule {
        const options: IssuerModuleOptions = Object.assign(
            {
                enableCertificationRequest: true
            },
            originalOptions
        );

        return {
            module: IssuerModule,
            imports: [
                OptionsModule.register(options),
                ConfigModule.forRoot({
                    envFilePath: getEnvFilePath(),
                    isGlobal: true
                }),
                CertificateModule,
                BlockchainPropertiesModule,
                ...(options.enableCertificationRequest ? [CertificationRequestModule] : [])
            ],
            providers
        };
    }
}
