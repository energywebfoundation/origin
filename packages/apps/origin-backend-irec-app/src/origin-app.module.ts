import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
    AccountModule,
    AppModule as ExchangeModule,
    entities as ExchangeEntities
} from '@energyweb/exchange';
import { ExchangeErc1888Module } from '@energyweb/exchange-io-erc1888';
import {
    AppModule as ExchangeIRECModule,
    entities as ExchangeIRECEntities
} from '@energyweb/exchange-irec';
import { AppModule as IssuerModule, entities as IssuerEntities } from '@energyweb/issuer-irec-api';
import {
    AppModule as OriginBackendModule,
    entities as OriginBackendEntities,
    OrganizationModule,
    UserModule
} from '@energyweb/origin-backend';
import { getDBConnectionOptions, HTTPLoggingInterceptor } from '@energyweb/origin-backend-utils';
import {
    AppModule as OriginDeviceRegistry,
    entities as OriginDeviceEntities
} from '@energyweb/origin-device-registry-api';
import {
    AppModule as IRECDeviceRegistry,
    DeviceModule as IrecDeviceModule,
    entities as IRECDeviceEntities
} from '@energyweb/origin-device-registry-irec-local-api';
import {
    AppModule as IRECOrganizationModule,
    entities as IRECOrganizationEntities,
    RegistrationModule
} from '@energyweb/origin-organization-irec-api';
import { ReadsModule } from '@energyweb/origin-energy-api';

import {
    CertificateRequestApprovedHandler,
    ConnectionCreatedHandler,
    CreateExchangeDepositAddressHandler,
    CreateIrecBeneficiaryHandler,
    DeviceCreatedHandler,
    DeviceStatusChangedHandler,
    EmailConfirmationRequestedHandler,
    InvitationCreatedHandler,
    IrecCertificateImportFailedHandler,
    OrganizationMemberRemovedHandler,
    OrganizationMemberRoleChangedHandler,
    OrganizationNameAlreadyTakenHandler,
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
        ...IRECDeviceEntities,
        ...ExchangeIRECEntities
    ];

    return TypeOrmModule.forRoot({
        ...getDBConnectionOptions(),
        entities,
        logging: ['info']
    });
};

@Module({
    imports: [
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
        IrecDeviceModule,
        ReadsModule,
        AccountModule
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
        ResetPasswordRequestedHandler,
        OrganizationRegisteredHandler,
        ConnectionCreatedHandler,
        IrecCertificateImportFailedHandler,
        OrganizationNameAlreadyTakenHandler,
        CreateExchangeDepositAddressHandler,
        CreateIrecBeneficiaryHandler
    ]
})
export class OriginAppModule {}
