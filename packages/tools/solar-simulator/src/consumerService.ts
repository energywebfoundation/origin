import parse from 'csv-parse/lib/sync';
import moment from 'moment-timezone';
import * as Winston from 'winston';
import dotenv from 'dotenv';
import fs from 'fs';
import { BigNumber } from 'ethers';

import { ProducingDevice, Configuration } from '@energyweb/device-registry';
import {
    DeviceClient,
    Configuration as ClientConfiguration,
    AuthClient
} from '@energyweb/origin-backend-client';
import { ISmartMeterRead, IEnergyGenerated } from '@energyweb/origin-backend-core';
import { getEnergyFromCSVRows } from './utils/Energy';

export function wait(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

async function createBlockchainConfiguration() {
    const logger = Winston.createLogger({
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        level: 'verbose',
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const backendUrl = `${process.env.BACKEND_URL}:${process.env.BACKEND_PORT}`;
    const authClient = new AuthClient(new ClientConfiguration(), backendUrl);
    const { data: loginResponse } = await authClient.login({
        username: 'admin@mailinator.com',
        password: 'test'
    });

    const clientConfiguration = new ClientConfiguration({
        baseOptions: {
            headers: {
                Authorization: `Bearer ${loginResponse.accessToken}`
            }
        },
        accessToken: loginResponse.accessToken
    });

    const conf: Configuration.Entity = {
        logger,
        deviceClient: new DeviceClient(clientConfiguration, backendUrl)
    };

    console.log(`[SIMULATOR-CONSUMER] Starting`);

    return conf;
}

export async function startConsumerService(
    configFilePath: string,
    dataFilePath: string
): Promise<void> {
    const CONFIG = JSON.parse(fs.readFileSync(configFilePath).toString());
    const DATA = parse(fs.readFileSync(dataFilePath), { columns: false, trim: true });

    const CHECK_INTERVAL = CONFIG.config.ENERGY_READ_CHECK_INTERVAL || 29000;
    const conf = await createBlockchainConfiguration();

    async function getProducingDeviceSmartMeterRead(deviceId: string): Promise<BigNumber> {
        const device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();

        const smartMeterReadings = await device.getSmartMeterReads();
        const latestSmRead = smartMeterReadings[smartMeterReadings.length - 1];

        return BigNumber.from(latestSmRead?.meterReading ?? 0);
    }

    async function saveProducingDeviceSmartMeterReads(
        deviceId: string,
        smartMeterReadings: ISmartMeterRead[]
    ) {
        console.log('-----------------------------------------------------------');

        try {
            let device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();
            await device.saveSmartMeterReads(smartMeterReadings);
            device = await device.sync();
            conf.logger.verbose(
                `Producing device ${deviceId} smart meter reading saved: ${JSON.stringify(
                    smartMeterReadings
                )}`
            );
        } catch (e) {
            conf.logger.error(`Could not save smart meter reading for producing device\n${e}`);
        }

        console.log('-----------------------------------------------------------\n');
    }

    console.log('Starting reading of energy generation');

    let previousTime = moment();

    while (true) {
        const now = moment();

        for (const device of CONFIG.devices) {
            const energyMeasurements: IEnergyGenerated[] = await getEnergyFromCSVRows(
                DATA,
                device,
                previousTime,
                now
            );

            if (!energyMeasurements.length) {
                continue;
            }

            const smartMeterReadings: ISmartMeterRead[] = [];
            let previousEnergyRead: BigNumber = await getProducingDeviceSmartMeterRead(device.id);

            for (const energyMeasurement of energyMeasurements) {
                if (!energyMeasurement.energy || energyMeasurement.energy.lt(0)) {
                    continue;
                }

                const newEnergyRead = previousEnergyRead.add(energyMeasurement.energy);

                smartMeterReadings.push({
                    meterReading: newEnergyRead,
                    timestamp: energyMeasurement.timestamp
                });

                previousEnergyRead = newEnergyRead;
            }

            await saveProducingDeviceSmartMeterReads(device.id, smartMeterReadings);

            console.log(
                `[Device ID: ${device.id}]::Saved Energy Reads : ${smartMeterReadings
                    .map((read) => `${read.meterReading} - ${moment.unix(read.timestamp).format()}`)
                    .join('\n')}`
            );
        }

        previousTime = now;

        await wait(CHECK_INTERVAL);
    }
}

if (require.main === module) {
    dotenv.config({
        path: '../../.env'
    });
    startConsumerService(`${__dirname}/../config/config.json`, `${__dirname}/../config/data.csv`);
}
