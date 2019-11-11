import * as fs from 'fs';
import parse from 'csv-parse/lib/sync';
import { Worker } from 'worker_threads';

import CONFIG from '../config/config.json';

const fileContent = fs.readFileSync(`${__dirname}/../config/data.csv`);
const DATA = parse(fileContent, { columns: false, trim: true });

(async () => {
    for (const asset of CONFIG.assets) {
        const worker = new Worker('./dist/js/src/workers/mockReadingsWorker.js', {
            workerData: {
                asset,
                DATA,
                path: './src/workers/mockReadingsWorker.ts'
            }
        });

        worker.on('message', result => {
            console.log(result);
        });
    }
})();
