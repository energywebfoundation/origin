import concurrently from 'concurrently';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: '../../.env'
});

if (process.env.SOLAR_SIMULATOR_DEPLOY_PAST_READINGS === 'true') {
    concurrently([{ command: `node ${path.join(__dirname, 'mockReadings.js')}`, name: 'mock' }], {
        prefix: 'name',
        killOthers: ['failure', 'success'],
        restartTries: 3,
        restartAfter: 1500
    });
} else {
    concurrently(
        [
            { command: `node ${path.join(__dirname, 'simulatorService.js')}`, name: 'server' },
            { command: `node ${path.join(__dirname, 'consumerService.js')}`, name: 'client' }
        ],
        {
            prefix: 'name',
            killOthers: ['failure', 'success'],
            restartTries: 3,
            restartAfter: 1500
        }
    );
}
