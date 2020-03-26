import { ConnectionOptions } from 'typeorm';

interface IApplicationConfig {
    JWT_SECRET: string;
    JWT_EXPIRY_TIME: string;
    PASSWORD_HASH_COST: number;
    ORM: ConnectionOptions;
    REGISTRATION_MESSAGE_TO_SIGN: string;
}

export default function createConfig(): IApplicationConfig {
    return {
        JWT_SECRET: process.env.JWT_SECRET ?? 'thisisnotsecret',
        JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME ?? '7 days',
        PASSWORD_HASH_COST: 8,
        ORM: {
            type: 'postgres',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT) ?? 5432,
            username: process.env.DB_USERNAME ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'postgres',
            database: process.env.DB_DATABASE ?? 'origin',
            synchronize: true,
            logging: ['info']
        } as ConnectionOptions,
        REGISTRATION_MESSAGE_TO_SIGN:
            process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user'
    };
}
