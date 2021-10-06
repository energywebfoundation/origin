import { ConnectionOptions } from 'typeorm';

export const getDBConnectionOptions = (): ConnectionOptions => {
    if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        return {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port, 10),
            username: url.username,
            password: url.password,
            database: url.pathname.replace('/', '')
        };
    }

    return {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'origin'
    };
};
