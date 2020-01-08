import { ConnectionOptions } from 'typeorm';

interface IApplicationConfig {
    JWT_SECRET: string;
    JWT_EXPIRY_TIME_MS: number;
    PASSWORD_HASH_COST: number;
    ORM: ConnectionOptions;
}

export default function createConfig(): IApplicationConfig {
    return {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRY_TIME_MS: parseInt(process.env.JWT_EXPIRY_TIME_MS, 10),
        PASSWORD_HASH_COST: 8,
        ORM: {
            type: process.env.ORM_TYPE || 'sqlite',
            database:
                process.env.ORM_DATABASE_DOCKER === 'TRUE' ? '/var/db/db.sqlite' : 'db.sqlite',
            synchronize: true,
            logging: false
        } as ConnectionOptions
    };
}
