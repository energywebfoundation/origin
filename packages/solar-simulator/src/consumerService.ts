import axios from 'axios';
import { Moment } from 'moment';
import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';
import dotenv from 'dotenv';

import { ProducingAsset } from '@energyweb/asset-registry';
import { createBlockchainProperties } from '@energyweb/market';
import { Configuration } from '@energyweb/utils-general';

import { OffChainDataClient, ConfigurationClient } from '@energyweb/origin-backend-client';
import CONFIG from '../config/config.json';

export function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

dotenv.config({
    path: '../../.env'
});

const CHECK_INTERVAL: number = CONFIG.config.ENERGY_READ_CHECK_INTERVAL || 29000;

const WEB3 = process.env.WEB3 || 'http://localhost:8545';

const ENERGY_API_BASE_URL = process.env.ENERGY_API_BASE_URL || `http://localhost:3031`;

async function createBlockchainConfiguration() {
    const web3 = new Web3(WEB3);

    const logger = Winston.createLogger({
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        level: 'verbose',
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const baseUrl = `${process.env.BACKEND_URL}/api`;

    const conf: Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        logger,
        offChainDataSource: {
            baseUrl,
            client: new OffChainDataClient()
        }
    };

    const storedMarketContractAddress = (
        await new ConfigurationClient().get(baseUrl, 'MarketContractLookup')
    ).pop();

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

async function startConsumerService() {
    const conf = await createBlockchainConfiguration();

    async function getProducingAssetSmartMeterRead(assetId: string): Promise<number> {
        const asset = await new ProducingAsset.Entity(assetId, conf).sync();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return parseInt((asset.lastSmartMeterReadWh as any) as string, 10);
    }

    async function saveProducingAssetSmartMeterRead(
        meterReading: number,
        assetId: string,
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
            let asset = await new ProducingAsset.Entity(assetId, conf).sync();
            await asset.saveSmartMeterRead(meterReading, '', timestamp);
            asset = await asset.sync();
            conf.logger.verbose(
                `Producing asset ${assetId} smart meter reading saved: ${meterReading}`
            );
        } catch (e) {
            conf.logger.error(`Could not save smart meter reading for producing asset\n${e}`);
        }

        console.log('-----------------------------------------------------------\n');
    }

    async function getEnergyMeasurements(
        assetId: string,
        startTime: Moment,
        endTime: Moment
    ): Promise<IEnergyMeasurement[]> {
        const url = `${ENERGY_API_BASE_URL}/asset/${assetId}/energy?accumulated=true&timeStart=${encodeURIComponent(
            startTime.unix()
        )}&timeEnd=${encodeURIComponent(endTime.unix())}`;

        console.log(`GET ${url}`);

        return (await axios.get(url)).data;
    }

    console.log('Starting reading of energy generation');

    let previousTime = moment();

    while (true) {
        const now = moment();

        for (const asset of CONFIG.assets) {
            const energyMeasurements: IEnergyMeasurement[] = await getEnergyMeasurements(
                asset.id,
                previousTime,
                now
            );

            for (const energyMeasurement of energyMeasurements) {
                if (!energyMeasurement.energy || energyMeasurement.energy < 0) {
                    continue;
                }

                const roundedEnergy: number = Math.round(energyMeasurement.energy);

                const previousRead: number = await getProducingAssetSmartMeterRead(asset.id);
                const time = moment(energyMeasurement.measurementTime);

                await saveProducingAssetSmartMeterRead(
                    previousRead + roundedEnergy,
                    asset.id,
                    time.unix(),
                    asset.smartMeterPrivateKey
                );

                console.log(
                    `[Asset ID: ${asset.id}]::Save Energy Read of: ${roundedEnergy}Wh - [${energyMeasurement.measurementTime}]`
                );
            }
        }

        previousTime = now;

        await wait(CHECK_INTERVAL);
    }
}

startConsumerService();
