import dotenv from 'dotenv';
import program from 'commander';
import path from 'path';

import { startConsumerService } from './consumerService';
import { mockData } from './mockReadings';

const absolutePath = (relativePath) => path.resolve(__dirname, relativePath);

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.option('-c, --config <config_file_path>', 'path to the config file');
program.option('-d, --data <data_file_path>', 'path to the data file');

program.parse(process.argv);

const envFile = program.env ? absolutePath(program.env) : '../../.env';
const configFilePath = absolutePath(program.config ?? '../config/config.json');
const dataFilePath = absolutePath(program.data ?? '../config/data.csv');

function initEnv() {
    if (envFile) {
        dotenv.config({
            path: envFile
        });
    } else {
        dotenv.config();
    }
}

(async () => {
    initEnv();

    console.log(
        `Running the simulator with:\n.env file: ${envFile}\nconfig file: ${configFilePath}\ndata file: ${dataFilePath}`
    );

    if (process.env.SOLAR_SIMULATOR_DEPLOY_PAST_READINGS === 'true') {
        await mockData(configFilePath, dataFilePath);
        console.log('Finished deploying past energy readings');
    }

    await startConsumerService(configFilePath, dataFilePath);
})();
