import { ConnectionOptions } from 'typeorm';
import ormConfig from './ormconfig';

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
        ORM: ormConfig,
        REGISTRATION_MESSAGE_TO_SIGN:
            process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user'
    };
}
