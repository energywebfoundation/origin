import axios from 'axios';
import { Moment } from 'moment';
import moment from 'moment-timezone';
import * as Winston from 'winston';
import dotenv from 'dotenv';
import fs from 'fs';
import { ethers } from 'ethers';
import { bigNumberify, BigNumber } from 'ethers/utils';

import { ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { ISmartMeterRead } from '@energyweb/origin-backend-core';

export function wait(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

async function createBlockchainConfiguration() {
    const web3 = new ethers.providers.JsonRpcProvider(process.env.WEB3 ?? 'http://localhost:8545');

    const logger = Winston.createLogger({
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        level: 'verbose',
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const conf: Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        logger,
        offChainDataSource: new OffChainDataSource(
            process.env.BACKEND_URL,
            Number(process.env.BACKEND_PORT)
        )
    };

    console.log(`[SIMULATOR-CONSUMER] Starting`);

    return conf;
}

interface IEnergyMeasurement {
    energy: number;
    measurementTime: string;
}

export async function startConsumerService(configFilePath: string) {
    const ENERGY_API_BASE_URL = process.env.ENERGY_API_BASE_URL || `http://localhost:3032`;
    const CONFIG = JSON.parse(fs.readFileSync(configFilePath).toString());
    const CHECK_INTERVAL = CONFIG.config.ENERGY_READ_CHECK_INTERVAL || 29000;
    const conf = await createBlockchainConfiguration();

    async function getProducingDeviceSmartMeterRead(deviceId: string): Promise<BigNumber> {
        const device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();

        return device.lastSmartMeterReadWh ?? bigNumberify(0);
    }

    async function saveProducingDeviceSmartMeterRead(
        deviceId: string,
        smartMeterReading: ISmartMeterRead
    ) {
        console.log('-----------------------------------------------------------');

        try {
            let device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();
            await device.saveSmartMeterRead(
                smartMeterReading.meterReading,
                smartMeterReading.timestamp
            );
            device = await device.sync();
            conf.logger.verbose(
                `Producing device ${deviceId} smart meter reading saved: ${JSON.stringify(
                    smartMeterReading
                )}`
            );
        } catch (e) {
            conf.logger.error(`Could not save smart meter reading for producing device\n${e}`);
        }

        console.log('-----------------------------------------------------------\n');
    }

    async function getEnergyMeasurements(
        deviceId: string,
        startTime: Moment,
        endTime: Moment
    ): Promise<IEnergyMeasurement[]> {
        const url = `${ENERGY_API_BASE_URL}/device/${deviceId}/energy?accumulated=true&timeStart=${encodeURIComponent(
            startTime.unix()
        )}&timeEnd=${encodeURIComponent(endTime.unix())}`;

        console.log(`GET ${url}`);

        return (await axios.get(url)).data;
    }

    console.log('Starting reading of energy generation');

    let previousTime = moment();

    while (true) {
        const now = moment();

        for (const device of CONFIG.devices) {
            const energyMeasurements: IEnergyMeasurement[] = await getEnergyMeasurements(
                device.id,
                previousTime,
                now
            );

            for (const energyMeasurement of energyMeasurements) {
                if (!energyMeasurement.energy || energyMeasurement.energy < 0) {
                    continue;
                }

                const roundedEnergy: BigNumber = bigNumberify(Math.round(energyMeasurement.energy));

                const previousRead: BigNumber = await getProducingDeviceSmartMeterRead(device.id);
                const time = moment(energyMeasurement.measurementTime);

                const smartMeterReading: ISmartMeterRead = {
                    meterReading: previousRead.add(roundedEnergy),
                    timestamp: time.unix()
                };

                await saveProducingDeviceSmartMeterRead(device.id, smartMeterReading);

                console.log(
                    `[Device ID: ${device.id}]::Save Energy Read of: ${roundedEnergy}Wh - [${energyMeasurement.measurementTime}]`
                );
            }
        }

        previousTime = now;

        await wait(CHECK_INTERVAL);
    }
}

if (require.main === module) {
    dotenv.config({
        path: '../../.env'
    });
    startConsumerService(`${__dirname}/../config/config.json`);
}
