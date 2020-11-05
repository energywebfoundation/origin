import { ConnectionOptions } from 'typeorm';

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
    synchronize: false,
    migrationsRun: true,
    migrations: [`${__dirname}/migrations/*.js`],
    migrationsTableName: 'migrations_issuer'
};

export = config;
