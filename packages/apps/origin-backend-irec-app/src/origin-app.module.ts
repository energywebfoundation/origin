import { AppModule as ExchangeModule, entities as ExchangeEntities } from '@energyweb/exchange';
import { ExchangeErc1888Module } from '@energyweb/exchange-io-erc1888';
import { AppModule as ExchangeIRECModule } from '@energyweb/exchange-irec';
import { AppModule as IssuerModule, entities as IssuerEntities } from '@energyweb/issuer-irec-api';
import {
    AppModule as OriginBackendModule,
    entities as OriginBackendEntities,
    OrganizationModule,
    UserModule
} from '@energyweb/origin-backend';
import { HTTPLoggingInterceptor } from '@energyweb/origin-backend-utils';
import {
    AppModule as OriginDeviceRegistry,
    entities as OriginDeviceEntities
} from '@energyweb/origin-device-registry-api';
import {
    DeviceModule as IrecDeviceModule,
    AppModule as IRECDeviceRegistry,
    entities as IRECDeviceEntities
} from '@energyweb/origin-device-registry-irec-local-api';
import {
    AppModule as IRECOrganizationModule,
    entities as IRECOrganizationEntities,
    RegistrationModule
} from '@energyweb/origin-organization-irec-api';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    RegistrationCreatedHandler
} from '.';
import { IntegrationModule } from './integration';
import { MailModule } from './mail';
import { CheckDeviceStateTask, RefreshAllTokensTask } from './cron';

const OriginAppTypeOrmModule = () => {
    const entities = [
        ...OriginBackendEntities,
        ...ExchangeEntities,
        ...IRECOrganizationEntities,
        ...IssuerEntities,
        ...OriginDeviceEntities,
        ...IRECDeviceEntities
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

@Module({
    imports: [
        ScheduleModule.forRoot(),
        OriginAppTypeOrmModule(),
        OriginBackendModule,
        IRECDeviceRegistry,
        IntegrationModule,
        MailModule,
        ExchangeModule,
        ExchangeErc1888Module,
        ExchangeIRECModule,
        IRECOrganizationModule,
        IssuerModule,
        OrganizationModule,
        OriginDeviceRegistry,
        UserModule,
        CqrsModule,
        RegistrationModule,
        IrecDeviceModule
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
        CheckDeviceStateTask,
        RefreshAllTokensTask
    ]
})
export class OriginAppModule {}
