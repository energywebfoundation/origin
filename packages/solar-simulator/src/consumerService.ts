import axios from 'axios';
import { Moment } from 'moment';
import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';
import dotenv from 'dotenv';
import fs from 'fs';

import { ProducingDevice } from '@energyweb/device-registry';
import { createBlockchainProperties } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSource } from '@energyweb/origin-backend-client';

export function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function createBlockchainConfiguration() {
    const web3 = new Web3(process.env.WEB3 ?? 'http://localhost:8545');

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

    let storedMarketContractAddresses: string[] = [];

    console.log(`[SIMULATOR-CONSUMER] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await conf.offChainDataSource.configurationClient.get(
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    console.log(`[SIMULATOR-CONSUMER] Starting for Market ${storedMarketContractAddress}`);

    const latestMarketContractLookupAddress: string =
        process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;

    conf.blockchainProperties = await createBlockchainProperties(
        conf.blockchainProperties.web3,
        latestMarketContractLookupAddress
    );

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

    async function getProducingDeviceSmartMeterRead(deviceId: string): Promise<number> {
        const device = await new ProducingDevice.Entity(deviceId, conf).sync();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parseInt((device.lastSmartMeterReadWh as any) as string, 10);
    }

    async function saveProducingDeviceSmartMeterRead(
        meterReading: number,
        deviceId: string,
        timestamp: number,
        smartMeterPrivateKey: string
    ) {
        console.log('-----------------------------------------------------------');

        const smartMeterAddress: string = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(
            smartMeterPrivateKey
        ).address;

        conf.blockchainProperties.activeUser = {
            address: smartMeterAddress,
            privateKey: smartMeterPrivateKey
        };

        try {
            let device = await new ProducingDevice.Entity(deviceId, conf).sync();
            await device.saveSmartMeterRead(meterReading, timestamp);
            device = await device.sync();
            conf.logger.verbose(
                `Producing device ${deviceId} smart meter reading saved: ${meterReading}`
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

                const roundedEnergy: number = Math.round(energyMeasurement.energy);

                const previousRead: number = await getProducingDeviceSmartMeterRead(device.id);
                const time = moment(energyMeasurement.measurementTime);

                await saveProducingDeviceSmartMeterRead(
                    previousRead + roundedEnergy,
                    device.id,
                    time.unix(),
                    device.smartMeterPrivateKey
                );

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
