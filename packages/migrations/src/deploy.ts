import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';
import fs from 'fs';

import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';

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

    const { currencies, country, complianceRegistry, deviceTypes, externalDeviceIdTypes } = JSON.parse(
        fs.readFileSync(configFilePath, 'utf8').toString()
    );

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

    await offChainDataSource.configurationClient.update({
        complianceStandard: complianceRegistry,
        countryName: country.name,
        regions: JSON.stringify(country.regions),
        deviceTypes: JSON.stringify(deviceTypes),
        externalDeviceIdTypes,
        currencies
    });

    const contractConfig = await deployEmptyContracts();

    await marketDemo(configFilePath, contractConfig);

    let marketContractLookup: string = null;

    if (contractConfig && contractConfig.marketLogic) {
        marketContractLookup = contractConfig.marketLogic.toLowerCase();
    }
    
    await offChainDataSource.configurationClient.update({
        marketContractLookup
    });

    offChainDataSource.eventClient.stop();
})();
