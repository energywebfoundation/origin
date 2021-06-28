import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';

import { IrecService } from './irec.service';
import { IrecMockService } from './irec.mock.service';

export const IREC_SERVICE = Symbol('IREC Service');

const irecServiceProvider = {
    provide: IREC_SERVICE,
    useFactory: (configService: ConfigService, commandBus: CommandBus) => {
        const isIrecEnabled = !!configService.get<string>('IREC_API_URL');
        if (isIrecEnabled) {
            return new IrecService(commandBus, configService);
        } else {
            return new IrecMockService();
        }
    },
    inject: [ConfigService, CommandBus]
};

@Module({
    imports: [ConfigModule, CqrsModule],
    providers: [irecServiceProvider],
    exports: [irecServiceProvider],
    controllers: []
})
export class IrecModule {}
