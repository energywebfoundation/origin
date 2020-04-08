import path from 'path';
import { ConnectionOptions } from 'typeorm';

const ormConfig: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 5432,
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'origin',
    synchronize: process.env.MODE !== 'production',
    logging: ['info'],
    migrationsRun: process.env.MODE === 'production',
    logger: 'file',
    migrations: [path.join(__dirname, '/migrations/**/*{.ts,.js}')],
    cli: {
        migrationsDir: 'src/migrations'
    }
};

export = ormConfig;
