import { ConnectionOptions } from 'typeorm';
import { getDBConnectionOptions } from '@energyweb/origin-backend-utils';

const config: ConnectionOptions = {
    ...(getDBConnectionOptions() as ConnectionOptions),
    synchronize: false,
    migrationsRun: true,
    migrations: [`${__dirname}/migrations/*.js`],
    migrationsTableName: 'migrations_device_registry_irec_local'
};

export = config;
