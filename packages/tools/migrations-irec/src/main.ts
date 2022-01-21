import dotenv from 'dotenv';
import program from 'commander';
import fs from 'fs';
import { ethers } from 'ethers';
import { Client, ClientConfig } from 'pg';
import { ConnectionOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { ExternalDeviceIdType } from '@energyweb/origin-backend-core';
import { IContractsLookup } from '@energyweb/issuer';
import { getDBConnectionOptions } from '@energyweb/origin-backend-utils';
import {
    AccountDeployerModule,
    AccountModule,
    AccountService,
    entities
} from '@energyweb/exchange';

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

program.parse(process.argv);

async function connectToDB() {
    const postgresConfig = getDBConnectionOptions() as ClientConfig;
    const client = new Client(postgresConfig);

    await client.connect();
    logger.info(
        `Connected to ${postgresConfig.host}:${postgresConfig.port} - database ${postgresConfig.database}`
    );
    return client;
}

async function importConfiguration(client: Client, configPath: string) {
    const parsedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8').toString());
    const { currencies, countryName, regions, complianceStandard, deviceTypes, gridOperators } =
        parsedConfig;

    const { externalDeviceIdTypes }: { externalDeviceIdTypes: ExternalDeviceIdType[] } =
        parsedConfig;

    if (currencies.length < 1) {
        throw new Error('At least one currency has to be specified: e.g. [ "USD" ]');
    }

    logger.info(`Saving configuration...`);
    const newConfigurationQuery = {
        text: 'INSERT INTO public.configuration (id, "countryName", currencies, regions, "externalDeviceIdTypes", "complianceStandard", "deviceTypes", "gridOperators") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        values: [
            '1',
            countryName,
            currencies.toString(),
            JSON.stringify(regions),
            JSON.stringify(externalDeviceIdTypes),
            complianceStandard,
            JSON.stringify(deviceTypes),
            gridOperators?.toString()
        ]
    };
    await client.query(newConfigurationQuery);
}

async function importContracts(
    client: Client,
    provider: ethers.providers.FallbackProvider,
    contractsLookup: IContractsLookup
) {
    const [primaryRpc, fallbackRpc] = process.env.WEB3.split(';');

    logger.info(`Saving contracts...`);
    const newContractsQuery = {
        text: 'INSERT INTO public.issuer_blockchain_properties ("netId", "registry", "issuer", "rpcNode", "rpcNodeFallback") VALUES ($1, $2, $3, $4, $5)',
        values: [
            provider.network.chainId,
            contractsLookup.registry,
            contractsLookup.issuer,
            primaryRpc,
            fallbackRpc
        ]
    };
    await client.query(newContractsQuery);

    const signerQuery = {
        text: 'INSERT INTO public.issuer_signer ("blockchainNetId", "platformOperatorPrivateKey", "isEncrypted") VALUES ($1, $2, $3)',
        values: [provider.network.chainId, process.env.DEPLOY_KEY, false]
    };

    await client.query(signerQuery);
}

async function isFirstMigration(client: Client) {
    try {
        const { rows } = await client.query('SELECT * FROM public.issuer_blockchain_properties;');
        return rows.length === 0;
    } catch (e) {
        logger.error(e.message);
        return false;
    }
}

async function hasSchema(client: Client) {
    try {
        await client.query('SELECT * FROM public.configuration;');
        return true;
    } catch (e) {
        logger.error(e.message);
        return false;
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

async function createExchangeDepositAddresses(client: Client) {
    logger.info(`Creating exchange deposit addresses...`);
    const { rows } = await client.query<{ id: number }>(
        'SELECT id FROM public.platform_organization;'
    );

    const postgresConfig = getDBConnectionOptions() as ConnectionOptions;
    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                entities: entities,
                logging: ['info'],
                ...postgresConfig
            }),
            AccountModule,
            AccountDeployerModule
        ]
    }).compile();

    const app = moduleFixture.createNestApplication();
    const accountService = app.get(AccountService);

    for (const { id } of rows) {
        try {
            await accountService.createSynchronously(String(id));
            logger.info(`Exchange deposit address created for orgId=${id}`);
        } catch (err) {
            logger.error(`Unable to create exchange deposit address for ${id}: ${err.message}`);
        }
    }
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
        const isMigrated = await hasSchema(dbClient);

        if (!isMigrated) {
            logger.error('Seems that migration script for SQL has not been run before.');
            process.exit(1);
        }

        const isFirst = await isFirstMigration(dbClient);

        logger.info(`Is first migration: ${isFirst}`);

        if (!isFirst) {
            logger.info('Migration script assumes that contracts were not previously deployed');
            process.exit(0);
        }

        if (!program.config || !fs.existsSync(program.config)) {
            throw new Error('Config path is missing or path does not exist');
        }
        if (!process.env.WEB3) {
            throw new Error('process.env.WEB3 is missing');
        }
        if (!process.env.DEPLOY_KEY) {
            throw new Error('process.env.DEPLOY_KEY is missing');
        }

        logger.info(`Deploying contracts to ${process.env.WEB3}...`);

        const provider = getProviderWithFallback(...process.env.WEB3.split(';'));
        const contractsLookup = await deployContracts(provider);

        await importSeed(dbClient, program.seedFile);
        await importConfiguration(dbClient, program.config);
        await importContracts(dbClient, provider, contractsLookup);
        await createExchangeDepositAddresses(dbClient);

        process.exit(0);
    })();
} catch (e) {
    process.exit(1);
}
