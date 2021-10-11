import { ConnectionOptions } from 'typeorm';
import { entities } from './src';
import { getDBConnectionOptions } from '@energyweb/origin-backend-utils';

const config: ConnectionOptions = {
    ...(getDBConnectionOptions() as ConnectionOptions),
    entities,
    synchronize: false,
    migrationsRun: true,
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations_irec_issuer',
    cli: {
        migrationsDir: 'migrations'
    }
};

export = config;
