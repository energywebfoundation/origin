import dotenv from 'dotenv';

import { startAPI } from './simulatorService';
import { startConsumerService } from './consumerService';
import { mockData } from './mockReadings';

dotenv.config({
    path: '../../.env'
});

const configFilePath = `${__dirname}/${
    process.argv[2] ? process.argv[2] : '../config/config.json'
}`;
const dataFilePath = `${__dirname}/${process.argv[3] ? process.argv[3] : '../config/data.csv'}`;

(async () => {
    if (process.env.SOLAR_SIMULATOR_DEPLOY_PAST_READINGS === 'true') {
        await mockData(configFilePath, dataFilePath);
        console.log('Finished deploying past energy readings');
    }

    await startAPI(configFilePath, dataFilePath);
    await startConsumerService(configFilePath);
})();
