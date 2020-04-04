import bodyParser from 'body-parser';
import cors from 'cors';
import parse from 'csv-parse/lib/sync';
import express from 'express';
import fs from 'fs-extra';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import { Server } from 'http';
import { AddressInfo } from 'net';

type TableRowType = string[3];

enum ENERGY_UNIT {
    joule = 'joule',
    wattHour = 'wattHour',
    kilowattHour = 'kilowattHour',
    megawattHour = 'megawattHour',
    gigawattHour = 'gigawattHour'
}

interface IDeviceGetResponse {
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
    deviceTimezone: string,
    timeStart: moment.Moment,
    timeEnd: moment.Moment,
    accumulated: boolean,
    energyUnit: ENERGY_UNIT = ENERGY_UNIT.wattHour
) {
    const parsedRows = [];
    const currentYear = moment().year();

    function calculateRowEnergy(ratio: string) {
        const maxCapacityInDeviceUnit = maxCapacity * ENERGY_UNIT_TO_RATIO_MAPPING[energyUnit];

        return parseFloat(ratio) * maxCapacityInDeviceUnit;
    }

    function checkTimeInBounds(time: moment.Moment) {
        let include = true;

        if (timeStart) {
            include = time.unix() >= timeStart.unix();
        }

        if (timeEnd && include) {
            include = time.unix() <= timeEnd.unix();
        }

        return include;
    }

    function parseRowTime(row: TableRowType): moment.Moment {
        return moment.tz(row[0], 'DD.MM.YYYY HH:mm', deviceTimezone).year(currentYear);
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

const DEFAULT_ENERGY_ROWS_LIMIT = 5;

export async function startAPI(configFilePath: string, dataFilePath: string): Promise<Server> {
    const CONFIG = JSON.parse(fs.readFileSync(configFilePath).toString());
    const PORT = extractPort(process.env.ENERGY_API_BASE_URL) || 3032;
    const DATA = parse(fs.readFileSync(dataFilePath), { columns: false, trim: true });

    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.options('*', cors());

    app.get('/device/:id/energy', async (req, res) => {
        console.log(`GET - /device/${req.params.id}/energy`);

        const device = CONFIG.devices.find((a) => a.id === req.params.id);

        if (!device) {
            return res.status(404).json({
                error: 'DEVICE_NOT_FOUND',
                message: `Device not found.`
            });
        }

        const LIMIT = req.query.limit ? parseInt(req.query.limit, 10) : DEFAULT_ENERGY_ROWS_LIMIT;

        const timeStart = req.query.timeStart ? moment.unix(req.query.timeStart) : null;
        const timeEnd = req.query.timeEnd ? moment.unix(req.query.timeEnd) : null;
        const accumulated = req.query.accumulated === 'true';

        const rows = DATA;

        let filteredReads = processRows(
            rows,
            device.maxCapacity,
            device.timezone,
            timeStart,
            timeEnd,
            accumulated,
            (ENERGY_UNIT as any)[device.energy_unit]
        );

        if (LIMIT !== -1) {
            filteredReads = filteredReads.slice(0, LIMIT);
        }

        return res.json(filteredReads);
    });

    app.get('/device/:id', async (req, res) => {
        console.log(`GET - /device/${req.params.id}`);

        const device = CONFIG.devices.find((a) => a.id === req.params.id);

        if (!device) {
            return res.status(404).json({
                error: 'DEVICE_NOT_FOUND',
                message: `Device not found.`
            });
        }

        const response: IDeviceGetResponse = {
            id: device.id.toString(),
            role: device.role,
            manufacturer: device.manufacturer,
            model: device.model,
            serial_number: device.serial_number,
            latitude: device.latitude,
            longitude: device.longitude,
            energy_unit: (ENERGY_UNIT as any)[device.energy_unit]
        };

        return res.json(response);
    });

    const appInstance = app.listen(PORT, () => {
        console.log(
            `Simulate Energy Generation API running on port: ${
                (appInstance.address() as AddressInfo).port
            }`
        );
    });

    return appInstance;
}

if (require.main === module) {
    dotenv.config({
        path: '../../.env'
    });

    (async () => {
        await startAPI(`${__dirname}/../config/config.json`, `${__dirname}/../config/data.csv`);
    })();
}
