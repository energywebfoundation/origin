import { DynamicModule, Module, Global } from '@nestjs/common';
import { ISSUER_MODULE_OPTIONS_TOKEN } from './const';
import { IssuerModuleOptions } from './types';

@Global()
@Module({})
export class OptionsModule {
    static register(options: IssuerModuleOptions): DynamicModule {
        const optionsProvider = {
            provide: ISSUER_MODULE_OPTIONS_TOKEN,
            useValue: options
        };

        return {
            module: OptionsModule,
            providers: [optionsProvider],
            exports: [optionsProvider]
        };
    }
}
