import { ConnectionOptions } from 'typeorm';
import { getDBConnectionOptions } from '@energyweb/origin-backend-utils';
import { entities } from './src';

const config: ConnectionOptions = {
    ...(getDBConnectionOptions() as ConnectionOptions),
    entities,
    synchronize: false,
    migrationsRun: true,
    migrations: [`${__dirname}/migrations/*.js`],
    migrationsTableName: 'migrations_irec_issuer'
};

export = config;
