import { parentPort, workerData } from 'worker_threads';

import dotenv from 'dotenv';
import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';

import { ProducingAsset } from '@energyweb/asset-registry';
import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties } from '@energyweb/market';
import { OffChainDataClient, ConfigurationClient } from '@energyweb/origin-backend-client';

dotenv.config({
    path: '../../.env'
});

const web3 = new Web3(process.env.WEB3);
const baseUrl = `${process.env.BACKEND_URL}/api`;

console.log('mockReadingsWorker', {
    processEnvWeb3: process.env.WEB3,
    baseUrl
});

async function getMarketContractLookupAddress() {
    let storedMarketContractAddresses: string[] = [];

    console.log(`[SIMULATOR-MOCK-READINGS] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await new ConfigurationClient().get(
            baseUrl,
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    return process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;
}

async function getAssetConf(marketContractLookupAddress: string) {
    const conf: Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        offChainDataSource: {
            baseUrl,
            client: new OffChainDataClient()
        },
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };

    conf.blockchainProperties = await createBlockchainProperties(
        conf.blockchainProperties.web3,
        marketContractLookupAddress
    );

    return conf;
}

async function getProducingAssetSmartMeterRead(
    assetId: string,
    conf: Configuration.Entity
): Promise<number> {
    const asset = await new ProducingAsset.Entity(assetId, conf).sync();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parseInt((asset.lastSmartMeterReadWh as any) as string, 10);
}

async function saveProducingAssetSmartMeterRead(
    meterReading: number,
    assetId: string,
    timestamp: number,
    smartMeterPrivateKey: string,
    conf: Configuration.Entity
) {
    console.log('-----------------------------------------------------------');

    const smartMeterAddress: string = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(
        smartMeterPrivateKey
    ).address;

    // eslint-disable-next-line no-param-reassign
    conf.blockchainProperties.activeUser = {
        address: smartMeterAddress,
        privateKey: smartMeterPrivateKey
    };

    let asset;

    try {
        asset = await new ProducingAsset.Entity(assetId, conf).sync();
        await asset.saveSmartMeterRead(meterReading, '', timestamp);
        asset = await asset.sync();
        conf.logger.verbose(
            `Producing asset ${assetId} smart meter reading saved: ${meterReading}`
        );
    } catch (e) {
        conf.logger.error(`Could not save smart meter reading for producing asset\n${e}`);

        console.error({
            assetId: asset.id,
            meterReading,
            time: moment.unix(timestamp).format(),
            smpk: smartMeterPrivateKey
        });
    }

    console.log('-----------------------------------------------------------\n');
}

const { asset } = workerData;

const currentTime = moment.tz(asset.timezone);
const measurementTime = currentTime
    .clone()
    .subtract(1, 'day')
    .startOf('day');

(async () => {
    const marketContractLookupAddress = await getMarketContractLookupAddress();
    const conf = await getAssetConf(marketContractLookupAddress);

    while (measurementTime.isSameOrBefore(currentTime)) {
        const generateReadingsTimeData = workerData.DATA.find(
            (row: any) =>
                row[0] ===
                measurementTime
                    .clone()
                    .year(2015)
                    .format('DD.MM.YYYY HH:mm')
        );

        const multiplier = parseFloat(generateReadingsTimeData[1]);
        const energyGenerated = Math.round(asset.maxCapacity * multiplier);

        const isValidMeterReading = energyGenerated > 0;

        if (isValidMeterReading) {
            try {
                const previousRead: number = await getProducingAssetSmartMeterRead(asset.id, conf);

                await saveProducingAssetSmartMeterRead(
                    previousRead + energyGenerated,
                    asset.id,
                    measurementTime.unix(),
                    asset.smartMeterPrivateKey,
                    conf
                );
            } catch (error) {
                console.error(`Error while trying to save meter read for asset ${asset.id}`);
            }
        }

        parentPort.postMessage(
            `[Asset ID: ${asset.id}]:${
                isValidMeterReading ? 'Saved' : 'Skipped'
            } Energy Read of: ${energyGenerated} Wh - [${measurementTime.format()}]`
        );

        measurementTime.add(15, 'minute');
    }
})();
