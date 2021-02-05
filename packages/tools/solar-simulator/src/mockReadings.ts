/* eslint no-loop-func: 1 */
import * as fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { Worker } from 'worker_threads';
import path from 'path';
import dotenv from 'dotenv';

function getMockReadingsWorkerLocation() {
    let location = './dist/js/src/workers/mockReadingsWorker.js';

    const sameLocationPath = path.join(__dirname, 'workers/mockReadingsWorker.js');
    if (fs.existsSync(sameLocationPath)) {
        location = sameLocationPath;
    }

    return location;
}

export async function mockData(configFilePath: string, dataFilePath: string): Promise<any> {
    const CONFIG = JSON.parse(fs.readFileSync(configFilePath).toString());
    const DATA = parse(fs.readFileSync(dataFilePath), { columns: false, trim: true });

    const location = getMockReadingsWorkerLocation();

    return new Promise((resolve) => {
        let counter = 0;

        function incrementAndResolve() {
            counter++;

            if (counter >= CONFIG.devices.length) {
                resolve('done');
            }
        }

        for (const device of CONFIG.devices) {
            const worker = new Worker(location, {
                workerData: {
                    device,
                    DATA
                }
            });

            worker.on('message', (message) => console.log(message));

            worker.on('exit', incrementAndResolve);
        }
    });
}

if (require.main === module) {
    dotenv.config({
        path: '../../.env'
    });

    (async () => {
        await mockData(`${__dirname}/../config/config.json`, `${__dirname}/../config/data.csv`);
    })();
}
