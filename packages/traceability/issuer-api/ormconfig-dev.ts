import { ConnectionOptions } from 'typeorm';

// e2e and development variables required for migration
process.env.DEPLOY_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
process.env.WEB3 = 'http://localhost:8581';

const getDBConnectionOptions = (): ConnectionOptions => {
    return process.env.DATABASE_URL
        ? {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              }
          }
        : {
              type: 'postgres',
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT) ?? 5432,
              username: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'origin'
          };
};

const config: ConnectionOptions = {
    ...getDBConnectionOptions(),
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
    migrationsRun: true,
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations_issuer',
    cli: {
        migrationsDir: 'migrations'
    }
};

export = config;
