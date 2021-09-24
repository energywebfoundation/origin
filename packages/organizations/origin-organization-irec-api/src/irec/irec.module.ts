import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';

import { UserModule, UserService } from '@energyweb/origin-backend';

import { IrecService } from './irec.service';
import { IrecMockService } from './irec.mock.service';

export const IREC_SERVICE = Symbol('IREC Service');

const irecServiceProvider = {
    provide: IREC_SERVICE,
    useFactory: (
        configService: ConfigService,
        commandBus: CommandBus,
        userService: UserService
    ) => {
        const isIrecEnabled = !!configService.get<string>('IREC_API_URL');
        if (isIrecEnabled) {
            return new IrecService(commandBus, configService, userService);
        } else {
            return new IrecMockService();
        }
    },
    inject: [ConfigService, CommandBus, UserService]
};

@Module({
    imports: [ConfigModule, CqrsModule, UserModule],
    providers: [irecServiceProvider, IrecService],
    exports: [irecServiceProvider, IrecService],
    controllers: []
})
export class IrecModule {}
