import concurrently from 'concurrently';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({
    path: '../../.env'
});

function getServiceCommand(name: string) {
    const jsPath = path.join(__dirname, `${name}.js`);
    const tsPath = path.join(__dirname, `${name}.ts`);

    let servicePath = tsPath;
    let processor = 'ts-node';

    if (fs.existsSync(jsPath)) {
        servicePath = jsPath;
        processor = 'node';
    }

    return `${processor} ${servicePath}`;
}

function runSimulatorAndConsumer() {
    concurrently(
        [
            { command: getServiceCommand('simulatorService'), name: 'server' },
            {
                command: `npx wait-on ${
                    process.env.ENERGY_API_BASE_URL
                }/asset/0/energy && ${getServiceCommand('consumerService')}`,
                name: 'client'
            }
        ],
        {
            prefix: 'name',
            killOthers: ['failure', 'success'],
            restartTries: 3,
            restartDelay: 1500
        }
    );
}

(async () => {
    if (process.env.SOLAR_SIMULATOR_DEPLOY_PAST_READINGS === 'true') {
        try {
            await concurrently([{ command: getServiceCommand('mockReadings'), name: 'mock' }], {
                prefix: 'name',
                killOthers: ['failure', 'success'],
                restartTries: 3,
                restartAfter: 1500,
                successCondition: 'last'
            });
        } catch (error) {
            console.error('Error while running simulator mock service', error);
        }

        console.log('Finished deploying past energy readings');
    }

    runSimulatorAndConsumer();
})();
