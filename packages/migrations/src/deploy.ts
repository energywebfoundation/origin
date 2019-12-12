import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';

import { marketDemo } from './market';
import { deployEmptyContracts } from './deployEmpty';
import { ConfigurationClient } from '@energyweb/origin-backend-client';

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

    const contractConfig = await deployEmptyContracts();

    await marketDemo(configFilePath, contractConfig);

    if (contractConfig && contractConfig.marketLogic) {
        await new ConfigurationClient().add(`${process.env.BACKEND_URL}/api`, 'MarketContractLookup', contractConfig.marketLogic.toLowerCase());
    }
})();
