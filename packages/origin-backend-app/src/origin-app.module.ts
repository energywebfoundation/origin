import { AppModule as ExchangeModule, entities as ExchangeEntities } from '@energyweb/exchange';
import { ExchangeErc1888Module } from '@energyweb/exchange-io-erc1888';
import { AppModule as ExchangeIRECModule } from '@energyweb/exchange-irec';
import { AppModule as IssuerModule, entities as IssuerEntities } from '@energyweb/issuer-api';
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
    entities as IRECOrganizationEntities
} from '@energyweb/origin-organization-irec-api';
import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
    DeviceCreatedHandler,
    DeviceStatusChangedHandler,
    EmailConfirmationRequestedHandler,
    InvitationCreatedHandler,
    OrganizationMemberRemovedHandler,
    OrganizationMemberRoleChangedHandler,
    OrganizationRegisteredHandler,
    OrganizationStatusChangedHandler,
    RegistrationCreatedHandler
} from '.';
import { IntegrationModule } from './integration';
import { MailModule } from './mail';

const OriginAppTypeOrmModule = () => {
    const entities = [
        ...OriginBackendEntities,
        ...ExchangeEntities,
        ...IRECOrganizationEntities,
        ...IssuerEntities
    ];

    return process.env.DATABASE_URL
        ? TypeOrmModule.forRoot({
              type: 'postgres',
              url: process.env.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              },
              entities,
              logging: ['info']
          })
        : TypeOrmModule.forRoot({
              type: 'postgres',
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT) ?? 5432,
              username: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'origin',
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
                OriginBackendModule.register(smartMeterReadingsAdapter),
                IntegrationModule,
                MailModule,
                ExchangeModule,
                ExchangeErc1888Module,
                ExchangeIRECModule,
                IRECOrganizationModule,
                IssuerModule,
                OrganizationModule,
                UserModule,
                CqrsModule
            ],
            providers: [
                { provide: APP_INTERCEPTOR, useClass: HTTPLoggingInterceptor },
                DeviceCreatedHandler,
                DeviceStatusChangedHandler,
                EmailConfirmationRequestedHandler,
                InvitationCreatedHandler,
                OrganizationMemberRemovedHandler,
                OrganizationMemberRoleChangedHandler,
                OrganizationStatusChangedHandler,
                RegistrationCreatedHandler,
                OrganizationRegisteredHandler
            ]
        };
    }
}
