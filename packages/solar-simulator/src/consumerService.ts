import { ProducingAsset } from '@energyweb/asset-registry';
import { createBlockchainProperties as assetCreateBlockchainProperties } from '@energyweb/asset-registry';
import { Configuration } from '@energyweb/utils-general';
import axios from 'axios';
import { Moment } from 'moment';
import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';
import CONFIG from '../config/config.json';

export function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    });
}

const CHECK_INTERVAL: number = CONFIG.config.ENERGY_READ_CHECK_INTERVAL || 29000;

const SOLAR_ASSET_GENERATION_TIMEZONE: string = CONFIG.config.SOLAR_ASSET_GENERATION_TIMEZONE || 'Europe/Berlin';
const WEB3_URL = CONFIG.config.WEB3_URL || 'http://localhost:8545';
const ASSET_CONTRACT_LOOKUP_ADDRESS = CONFIG.config.ASSET_CONTRACT_LOOKUP_ADDRESS || '0x24B207fFf1a1097d3c3D69fcE461544f83c6E774';
const ENERGY_API_BASE_URL = CONFIG.config.ENERGY_API_BASE_URL || `http://localhost:3031`;

async function getAssetConf()  {
    const web3 = new Web3(WEB3_URL);

    const logger = Winston.createLogger({
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        level: 'debug',
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const conf : Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        logger
    };

    conf.blockchainProperties = await assetCreateBlockchainProperties(
        conf.blockchainProperties.web3,
        ASSET_CONTRACT_LOOKUP_ADDRESS
    );

    return conf;
}

function parseTime(timeString) {
    return moment(timeString).tz(SOLAR_ASSET_GENERATION_TIMEZONE);
}

interface IEnergyMeasurement {
    energy: number;
    measurementTime: string;
}

async function getProducingAssetSmartMeterRead(
    assetId: string
) {
    const conf = await getAssetConf();

    const asset = await new ProducingAsset.Entity(assetId, conf).sync();

    return parseInt(asset.lastSmartMeterReadWh as any as string, 10);
}

async function saveProducingAssetSmartMeterRead(
    meterReading: number,
    assetId: string,
    timestamp: number,
    smartMeterPrivateKey: string
) {
    console.log('-----------------------------------------------------------');

    const conf = await getAssetConf();

    const smartMeterAddress: string = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(smartMeterPrivateKey).address;

    conf.blockchainProperties.activeUser = {
        address: smartMeterAddress,
        privateKey: smartMeterPrivateKey
    };

    try {
        let asset = await new ProducingAsset.Entity(assetId, conf).sync();
        await asset.saveSmartMeterRead(meterReading, '', timestamp);
        asset = await asset.sync();
        conf.logger.verbose(`Producing asset ${assetId} smart meter reading saved: ${meterReading}`);
    } catch (e) {
        conf.logger.error('Could not save smart meter reading for producing asset\n' + e);
    }

    console.log('-----------------------------------------------------------\n');
}

async function getEnergyMeasurements(
    assetId: string,
    startTime: Moment,
    endTime: Moment
): Promise<IEnergyMeasurement[]> {
    const url = ENERGY_API_BASE_URL + `/asset/${assetId}/energy?accumulated=true&timeStart=${encodeURIComponent(startTime.format())}&timeEnd=${encodeURIComponent(endTime.format())}`;
    
    console.log(`GET ${url}`);

    return (await axios.get(url)).data;
}

(async () => {
    console.log('Starting reading of energy generation');

    let previousTime = moment();

    while (true) {
        const now = moment();

        for (const asset of CONFIG.assets) {
            const energyMeasurements = await getEnergyMeasurements(asset.id, previousTime, now);

            for (const energyMeasurement of energyMeasurements) {
                if (!energyMeasurement.energy || energyMeasurement.energy < 0) {
                    continue;
                }

                const roundedEnergy = Math.round(energyMeasurement.energy);
    
                const previousRead = await getProducingAssetSmartMeterRead(asset.id);
                const time = parseTime(energyMeasurement.measurementTime);
    
                await saveProducingAssetSmartMeterRead(
                    previousRead + roundedEnergy,
                    asset.id,
                    time.unix(),
                    asset.smartMeterPrivateKey
                );
    
                console.log(`[Asset ID: ${asset.id}]::Save Energy Read of: ${roundedEnergy}Wh - [${time.format()}]`);
            }
        }

        previousTime = now;

        await wait(CHECK_INTERVAL);
    }
})();