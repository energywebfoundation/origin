import { AppModule as ExchangeModule, entities as ExchangeEntities } from '@energyweb/exchange';
import { ExchangeErc1888Module } from '@energyweb/exchange-io-erc1888';
import { AppModule as ExchangeIRECModule } from '@energyweb/exchange-irec';
import { IssuerModule, entities as IssuerEntities } from '@energyweb/issuer-api';
import {
    AppModule as OriginDeviceRegistry,
    entities as OriginDeviceEntities
} from '@energyweb/origin-device-registry-api';
import {
    AppModule as IRECFormDeviceRegistry,
    entities as IRECFormDeviceEntities
} from '@energyweb/origin-device-registry-irec-form-api';

import {
    AppModule as OriginBackendModule,
    entities as OriginBackendEntities,
    OrganizationModule,
    UserModule
} from '@energyweb/origin-backend';
import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { HTTPLoggingInterceptor } from '@energyweb/origin-backend-utils';
import {
    AppModule as IRECOrganizationModule,
    entities as IRECOrganizationEntities,
    RegistrationModule
} from '@energyweb/origin-organization-irec-api';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDBConnectionOptions } from '@energyweb/origin-backend-utils';

import {
    CertificateRequestApprovedHandler,
    DeviceCreatedHandler,
    DeviceStatusChangedHandler,
    EmailConfirmationRequestedHandler,
    InvitationCreatedHandler,
    OrganizationMemberRemovedHandler,
    OrganizationMemberRoleChangedHandler,
    OrganizationRegisteredHandler,
    OrganizationStatusChangedHandler,
    RegistrationCreatedHandler,
    ResetPasswordRequestedHandler
} from '.';
import { IntegrationModule } from './integration';
import { MailModule } from './mail';

const OriginAppTypeOrmModule = () => {
    const entities = [
        ...OriginBackendEntities,
        ...ExchangeEntities,
        ...IRECOrganizationEntities,
        ...IssuerEntities,
        ...OriginDeviceEntities,
        ...IRECFormDeviceEntities
    ];

    return TypeOrmModule.forRoot({
        ...getDBConnectionOptions(),
        entities,
        logging: ['info']
    });
};

@Module({})
export class OriginAppModule {
    static register(smartMeterReadingsAdapter: ISmartMeterReadingsAdapter): DynamicModule {
        return {
            module: OriginAppModule,
            imports: [
                OriginAppTypeOrmModule(),
                OriginBackendModule,
                IRECFormDeviceRegistry.register(smartMeterReadingsAdapter),
                IntegrationModule,
                MailModule,
                ExchangeModule,
                ExchangeErc1888Module,
                ExchangeIRECModule,
                IRECOrganizationModule,
                IssuerModule.register({}),
                OrganizationModule,
                OriginDeviceRegistry,
                UserModule,
                CqrsModule,
                RegistrationModule
            ],
            providers: [
                { provide: APP_INTERCEPTOR, useClass: HTTPLoggingInterceptor },
                CertificateRequestApprovedHandler,
                DeviceCreatedHandler,
                DeviceStatusChangedHandler,
                EmailConfirmationRequestedHandler,
                InvitationCreatedHandler,
                OrganizationMemberRemovedHandler,
                OrganizationMemberRoleChangedHandler,
                OrganizationStatusChangedHandler,
                RegistrationCreatedHandler,
                OrganizationRegisteredHandler,
                ResetPasswordRequestedHandler
            ]
        };
    }
}
