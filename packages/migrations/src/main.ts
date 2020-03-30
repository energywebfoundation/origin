import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';
import fs from 'fs';
import { Client, ClientConfig } from 'pg';

import { deployContracts } from './deployContracts';
import { logger } from './Logger';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.option('-c, --config <config_file_path>', 'path to the config file');
program.option('-s, --seed-file <seed_sql_path>', 'path to the SQL file that will be used for seeding the database');
program.option('-r, --redeploy', 're-deploy the contracts');

program.parse(process.argv);

const absolutePath = (relativePath: string) => path.resolve(__dirname, relativePath);

const envFile = program.env ? absolutePath(program.env) : '../../.env';
const configFilePath = absolutePath(program.config ?? '../config/demo-config.json');
const seedFilePath = absolutePath(program.seedFile ?? '../config/seed.sql');

(async () => {
    dotenv.config({
        path: envFile
    });

    const {
        currencies,
        countryName,
        regions,
        complianceStandard,
        deviceTypes,
        externalDeviceIdTypes
    } = JSON.parse(fs.readFileSync(configFilePath, 'utf8').toString());

    if (currencies.length < 1) {
        throw new Error('At least one currency has to be specified: e.g. [ "USD" ]');
    }

    const postgresConfig: ClientConfig = {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) ?? 5432,
        user: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_DATABASE ?? 'origin'
    };
    const client = new Client(postgresConfig);

    await client.connect();
    logger.info(`Connected to ${postgresConfig.host}:${postgresConfig.port} - database ${postgresConfig.database}`);
    const { rows } = await client.query('SELECT * FROM configuration;');

    if (rows[0]?.contractsLookup && !program.redeploy) {
        const errorTxt = `Contracts already deployed. Please use 'start:redeploy' to redeploy the contracts.`;
        logger.error(errorTxt);
        process.exit(1);
    }
    
    const contractsLookup = await deployContracts();

    if (rows[0]?.contractsLookup && program.redeploy) {
        logger.info(`Updating contract addresses...`);
        const newContractsQuery = {
            text: `UPDATE public.configuration SET "contractsLookup" = $1;`,
            values: [JSON.stringify(contractsLookup)]
        };
        await client.query(newContractsQuery);
    } else {
        logger.info(`Saving configuration...`);
        const newConfigurationQuery = {
            text: 'INSERT INTO public.configuration (id, "countryName", currencies, regions, "externalDeviceIdTypes", "contractsLookup", "complianceStandard", "deviceTypes") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            values: [
                '1',
                countryName,
                JSON.stringify(externalDeviceIdTypes),
                JSON.stringify(regions),
                JSON.stringify(externalDeviceIdTypes),
                JSON.stringify(contractsLookup),
                complianceStandard,
                JSON.stringify(deviceTypes)
            ]
        };
        await client.query(newConfigurationQuery);

        logger.info(`Running the seeding SQL file...`);
        const seedSql = fs.readFileSync(seedFilePath).toString();
        await client.query(seedSql);
    }
    
    logger.info('DONE.');
    process.exit(0);
})();
