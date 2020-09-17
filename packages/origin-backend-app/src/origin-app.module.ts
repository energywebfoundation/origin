import { AppModule as ExchangeModule, entities as ExchangeEntities } from '@energyweb/exchange';
import {
    AppModule as OriginBackendModule,
    entities as OriginBackendEntities
} from '@energyweb/origin-backend';
import {
    AppModule as IRECOrganizationModule,
    entities as IRECOrganizationEntities
} from '@energyweb/origin-organization-irec-api';

import { ISmartMeterReadingsAdapter } from '@energyweb/origin-backend-core';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const OriginAppTypeOrmModule = () => {
    const entities = [...OriginBackendEntities, ...ExchangeEntities, ...IRECOrganizationEntities];

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
                ExchangeModule,
                IRECOrganizationModule
            ]
        };
    }
}
