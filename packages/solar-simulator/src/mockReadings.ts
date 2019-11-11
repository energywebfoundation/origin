/* eslint no-loop-func: 1 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import parse from 'csv-parse/lib/sync';
import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';

import { ProducingAsset } from '@energyweb/asset-registry';
import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties } from '@energyweb/market';
import { OffChainDataClient, ConfigurationClient } from '@energyweb/origin-backend-client';

import CONFIG from '../config/config.json';

dotenv.config({
    path: '../../.env'
});

const fileContent = fs.readFileSync(`${__dirname}/../config/data.csv`);
const DATA = parse(fileContent, { columns: false, trim: true });

export async function getAssetConf() {
    const web3 = new Web3('http://localhost:8545');

    const conf: Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        offChainDataSource: {
            baseUrl: `${process.env.BACKEND_URL}/api`,
            client: new OffChainDataClient()
        },
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };

    const storedMarketContractAddress = (
        await new ConfigurationClient().get(conf.offChainDataSource.baseUrl, 'MarketContractLookup')
    ).pop();

    const latestMarketContractLookupAddress: string =
        process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;

    conf.blockchainProperties = await createBlockchainProperties(
        conf.blockchainProperties.web3,
        latestMarketContractLookupAddress
    );

    return conf;
}

async function getProducingAssetSmartMeterRead(assetId: string): Promise<number> {
    const conf = await getAssetConf();

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

    const conf = await getAssetConf();

    const smartMeterAddress: string = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(
        smartMeterPrivateKey
    ).address;

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

(async () => {
    const CSV_FORMAT = 'DD.MM.YYYY HH:mm';

    for (const asset of CONFIG.assets) {
        const currentTime = moment.tz(asset.timezone);
        let measurementTime = currentTime.subtract(1, 'week').startOf('day');

        while (measurementTime.isSameOrBefore(currentTime)) {
            const generateReadingsTimeData = DATA.find(
                (row: any) =>
                    row[0] ===
                    measurementTime
                        .clone()
                        .year(2015)
                        .format(CSV_FORMAT)
            );

            const multiplier = parseFloat(generateReadingsTimeData[1]);
            const energyGenerated = Math.round(asset.maxCapacity * multiplier);

            const isValidMeterReading = energyGenerated > 0;

            if (isValidMeterReading) {
                const previousRead: number = await getProducingAssetSmartMeterRead(asset.id);

                await saveProducingAssetSmartMeterRead(
                    previousRead + energyGenerated,
                    asset.id,
                    measurementTime.unix(),
                    asset.smartMeterPrivateKey
                );
            }

            console.log(
                `[Asset ID: ${asset.id}]:${
                    isValidMeterReading ? 'Saved' : 'Skipped'
                } Energy Read of: ${energyGenerated} Wh - [${measurementTime.format()}]`
            );

            measurementTime = measurementTime.add(15, 'minute');
        }
    }
})();
