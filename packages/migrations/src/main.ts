import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';
import fs from 'fs';
import { Client, ClientConfig } from 'pg';

import { ExternalDeviceIdType, IContractsLookup } from '@energyweb/origin-backend-core';
import { deployContracts } from './deployContracts';
import { logger } from './Logger';

program.option('-c, --config <config_file_path>', 'path to the config file');
program.option(
    '-s, --seed-file <seed_sql_path>',
    'path to the SQL file that will be used for seeding the database'
);
program.option(
    '-e, --env <env_file_path>',
    'path to the .env file or system variables when not set'
);
program.option(
    '-f, --force',
    'WARNING: Drop existing and migrate, allowed only when MODE is not set to PRODUCTION',
    false
);

program.parse(process.argv);

const absolutePath = (relativePath: string) => {
    if (!relativePath) {
        throw new Error('Path not set');
    }

    const resolved = path.resolve(__dirname, relativePath);

    if (!fs.existsSync(resolved)) {
        throw new Error(`Path ${resolved} does not exist`);
    }

    return resolved;
};

async function createSchema(client: Client, drop: boolean) {
    try {
        if (drop) {
            await client.query('DROP SCHEMA IF EXISTS public CASCADE');
        }

        await client.query('CREATE SCHEMA IF NOT EXISTS public');

        logger.info('Migrating tables to the database...');
        const createTablesQuery = fs
            .readFileSync(absolutePath('./schema/create_tables.sql'))
            .toString();
        await client.query(createTablesQuery);
    } catch (e) {
        logger.error(e);
        process.exit(1);
    }
}

async function connectToDB() {
    const postgresConfig: ClientConfig = process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false }
          }
        : {
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT) || 5432,
              user: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'origin'
          };
    const client = new Client(postgresConfig);

    await client.connect();
    logger.info(
        `Connected to ${postgresConfig.host}:${postgresConfig.port} - database ${postgresConfig.database}`
    );
    return client;
}

async function importConfiguration(
    client: Client,
    configPath: string,
    contractsLookup: IContractsLookup
) {
    const parsedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8').toString());
    const {
        currencies,
        countryName,
        regions,
        complianceStandard,
        deviceTypes,
        gridOperators
    } = parsedConfig;

    const {
        externalDeviceIdTypes
    }: { externalDeviceIdTypes: ExternalDeviceIdType[] } = parsedConfig;

    if (currencies.length < 1) {
        throw new Error('At least one currency has to be specified: e.g. [ "USD" ]');
    }

    logger.info(`Saving configuration...`);
    const newConfigurationQuery = {
        text:
            'INSERT INTO public.configuration (id, "countryName", currencies, regions, "externalDeviceIdTypes", "contractsLookup", "complianceStandard", "deviceTypes", "gridOperators") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        values: [
            '1',
            countryName,
            currencies.toString(),
            JSON.stringify(regions),
            JSON.stringify(externalDeviceIdTypes),
            JSON.stringify(contractsLookup),
            complianceStandard,
            JSON.stringify(deviceTypes),
            gridOperators?.toString()
        ]
    };
    await client.query(newConfigurationQuery);
}

async function isFirstMigration(client: Client) {
    try {
        const { rows } = await client.query('SELECT * FROM public.configuration;');
        return rows[0]?.contractsLookup === undefined;
    } catch (e) {
        return true;
    }
}

async function importSeed(client: Client, seedFile: string) {
    if (!fs.existsSync(seedFile)) {
        logger.info('Seed file was not provided. Skipping');
        return;
    }

    const seedSql = fs.readFileSync(seedFile).toString();

    await client.query(seedSql);
}

function initEnv() {
    if (program.env) {
        dotenv.config({
            path: program.env
        });
    } else {
        dotenv.config();
    }
}

try {
    (async () => {
        initEnv();

        const dbClient = await connectToDB();
        const isFirst = await isFirstMigration(dbClient);

        logger.info(`Is first migration: ${isFirst}`);
        logger.info(`Is force set: ${program.force}`);
        logger.info(`MODE=${process.env.MODE ?? '<Not set>'}`);

        if (isFirst || (program.force && process.env.MODE !== 'production')) {
            if (!program.config || !fs.existsSync(program.config)) {
                throw new Error('Config path is missing or path does not exist');
            }
            if (!process.env.WEB3) {
                throw new Error('process.env.WEB3 is missing');
            }
            if (!process.env.DEPLOY_KEY) {
                throw new Error('process.env.DEPLOY_KEY is missing');
            }

            await createSchema(dbClient, program.force);

            logger.info(`Deploying contracts to ${process.env.WEB3}...`);
            const contractsLookup = await deployContracts();

            await importConfiguration(dbClient, program.config, contractsLookup);

            await importSeed(dbClient, program.seedFile);
        }

        process.exit(0);

        // TODO: incremental migrations
    })();
} catch (e) {
    process.exit(1);
}
