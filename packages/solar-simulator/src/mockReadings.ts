import * as fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { Worker } from 'worker_threads';
import path from 'path';

import CONFIG from '../config/config.json';

const fileContent = fs.readFileSync(`${__dirname}/../config/data.csv`);
const DATA = parse(fileContent, { columns: false, trim: true });

function getMockReadingsWorkerLocation() {
    let location = './dist/js/src/workers/mockReadingsWorker.js';

    const sameLocationPath = path.join(__dirname, 'workers/mockReadingsWorker.js');
    if (fs.existsSync(sameLocationPath)) {
        location = sameLocationPath;
    }

    return location;
}

(async () => {
    const location = getMockReadingsWorkerLocation();

    for (const asset of CONFIG.assets) {
        const worker = new Worker(location, {
            workerData: {
                asset,
                DATA
            }
        });

        worker.on('message', result => {
            console.log(result);
        });
    }
})();
