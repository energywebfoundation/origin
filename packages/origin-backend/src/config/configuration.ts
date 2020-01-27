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
            type: process.env.ORM_TYPE ?? 'sqlite',
            database:
                process.env.ORM_DATABASE_DOCKER === 'TRUE' ? '/var/db/db.sqlite' : 'db.sqlite',
            synchronize: true,
            logging: false
        } as ConnectionOptions,
        REGISTRATION_MESSAGE_TO_SIGN:
            process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user'
    };
}
