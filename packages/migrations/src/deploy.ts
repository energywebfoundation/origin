import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';
import fs from 'fs';

import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { deployEmptyContracts } from './deployEmpty';
import { onboardDemo } from './onboarding';
import { marketDemo } from './market';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.option('-c, --config <config_file_path>', 'path to the config file');

program.parse(process.argv);

const absolutePath = (relativePath: string) => path.resolve(__dirname, relativePath);

const envFile = program.env ? absolutePath(program.env) : '../../.env';
const configFilePath = absolutePath(program.config ?? '../config/demo-config.json');

(async () => {
    dotenv.config({
        path: envFile
    });

    const {
        currencies,
        country,
        complianceRegistry,
        deviceTypes,
        externalDeviceIdTypes
    } = JSON.parse(fs.readFileSync(configFilePath, 'utf8').toString());

    if (!country) {
        throw new Error(
            'Please specify a country in the format: { name: "countryName", regions: {} }'
        );
    } else if (currencies.length < 1) {
        throw new Error('At least one currency has to be specified: e.g. [ "USD" ]');
    }

    const offChainDataSource = new OffChainDataSource(
        process.env.BACKEND_URL,
        Number(process.env.BACKEND_PORT)
    );

    const contractsLookup = await deployEmptyContracts();

    await offChainDataSource.configurationClient.update({
        complianceStandard: complianceRegistry,
        contractsLookup,
        countryName: country.name,
        regions: country.regions,
        deviceTypes,
        externalDeviceIdTypes,
        currencies
    });

    await marketDemo(configFilePath, contractsLookup);

    offChainDataSource.eventClient.stop();
})();
