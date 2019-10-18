import bodyParser from 'body-parser';
import cors from 'cors';
import parse from 'csv-parse/lib/sync';
import express from 'express';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import dotenv from 'dotenv';

import CONFIG from '../config/config.json';

dotenv.config({
    path: '../../.env'
});

type TableRowType = string[3];

enum ENERGY_UNIT {
    joule = 'joule',
    wattHour = 'wattHour',
    kilowattHour = 'kilowattHour',
    megawattHour = 'megawattHour',
    gigawattHour = 'gigawattHour'
}

interface IAssetGetResponse {
    id: string;
    role: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    latitude: number;
    longitude: number;
    energy_unit: ENERGY_UNIT;
}

const ENERGY_UNIT_TO_RATIO_MAPPING = {
    [ENERGY_UNIT.joule]: 3600,
    [ENERGY_UNIT.wattHour]: 1,
    [ENERGY_UNIT.kilowattHour]: 0.001,
    [ENERGY_UNIT.megawattHour]: 1e-6,
    [ENERGY_UNIT.gigawattHour]: 1e-9
};

function extractPort(url: string): number {
    if (url) {
        const backendUrlSplit: string[] = url.split(':');
        const extractedPort: number = parseInt(backendUrlSplit[backendUrlSplit.length - 1], 10);

        return extractedPort;
    }

    return null;
}

function processRows(
    rows: TableRowType[],
    maxCapacity: number,
    assetTimezone: string,
    timeStart: moment.Moment,
    timeEnd: moment.Moment,
    accumulated: boolean,
    energyUnit: ENERGY_UNIT = ENERGY_UNIT.wattHour
) {
    const parsedRows = [];
    const currentYear = moment().year();

    function calculateRowEnergy(ratio: string) {
        const maxCapacityInAssetUnit = maxCapacity * ENERGY_UNIT_TO_RATIO_MAPPING[energyUnit];

        return parseFloat(ratio) * maxCapacityInAssetUnit;
    }

    function checkTimeInBounds(time: moment.Moment) {
        let include = true;

        if (timeStart) {
            include = time >= timeStart;
        }

        if (timeEnd && include) {
            include = time <= timeEnd;
        }

        return include;
    }

    function parseRowTime(row: TableRowType): moment.Moment {
        return moment(row[0], 'DD.MM.YYYY HH:mm')
            .year(currentYear)
            .tz(assetTimezone);
    }

    if (accumulated) {
        parsedRows.push({
            energy: 0,
            measurementTime: ''
        });

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const time = parseRowTime(row);

            if (!checkTimeInBounds(time)) {
                continue;
            }

            parsedRows[0].energy += calculateRowEnergy(row[1]);
            parsedRows[0].measurementTime = time.format();
        }
    } else {
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const time = parseRowTime(row);

            if (!checkTimeInBounds(time)) {
                continue;
            }

            parsedRows.push({
                energy: calculateRowEnergy(row[1]),
                measurementTime: time.format()
            });
        }
    }

    return parsedRows;
}

let DATA: any;

async function getData() {
    if (DATA) {
        return DATA;
    }

    const fileContent = await fs.readFile(`${__dirname}/../config/data.csv`);
    DATA = parse(fileContent, { columns: false, trim: true });

    return DATA;
}

const PORT: number = extractPort(process.env.ENERGY_API_BASE_URL) || 3031;
const DEFAULT_ENERGY_ROWS_LIMIT = 5;

export async function startAPI() {
    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    app.use(cors());

    app.options('*', cors());

    app.get('/asset/:id/energy', async (req, res) => {
        console.log(`GET - /asset/${req.params.id}/energy`);

        const asset = CONFIG.assets.find(a => a.id === req.params.id);

        if (!asset) {
            return res.status(404).json({
                error: 'ASSET_NOT_FOUND',
                message: `Asset not found.`
            });
        }

        const LIMIT = req.query.limit ? parseInt(req.query.limit, 10) : DEFAULT_ENERGY_ROWS_LIMIT;

        const timeStart = req.query.timeStart ? moment(req.query.timeStart) : null;
        const timeEnd = req.query.timeEnd ? moment(req.query.timeEnd) : null;
        const accumulated = req.query.accumulated === 'true';

        const rows = await getData();

        let filteredReads = processRows(
            rows,
            asset.maxCapacity,
            asset.timezone,
            timeStart,
            timeEnd,
            accumulated,
            (ENERGY_UNIT as any)[asset.energy_unit]
        );

        if (LIMIT !== -1) {
            filteredReads = filteredReads.slice(0, LIMIT);
        }

        return res.json(filteredReads);
    });

    app.get('/asset/:id', async (req, res) => {
        console.log(`GET - /asset/${req.params.id}`);

        const asset = CONFIG.assets.find(a => a.id === req.params.id);

        if (!asset) {
            return res.status(404).json({
                error: 'ASSET_NOT_FOUND',
                message: `Asset not found.`
            });
        }

        const response: IAssetGetResponse = {
            id: asset.id.toString(),
            role: asset.role,
            manufacturer: asset.manufacturer,
            model: asset.model,
            serial_number: asset.serial_number,
            latitude: asset.latitude,
            longitude: asset.longitude,
            energy_unit: (ENERGY_UNIT as any)[asset.energy_unit]
        };

        return res.json(response);
    });

    return app.listen(PORT);
}

(async () => {
    await startAPI();
    console.log(`Simulate Energy Generation API running on port: ${PORT}`);
})();
