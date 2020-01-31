import { parentPort, workerData } from 'worker_threads';

import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';

import { ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties } from '@energyweb/market';
import {
    OffChainDataClient,
    ConfigurationClient,
    UserClient
} from '@energyweb/origin-backend-client';

const web3 = new Web3(process.env.WEB3);
const baseUrl = `${process.env.BACKEND_URL}/api`;

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

async function getDeviceConf(marketContractLookupAddress: string) {
    const conf: Configuration.Entity = {
        blockchainProperties: {
            web3
        },
        offChainDataSource: {
            baseUrl,
            client: new OffChainDataClient(),
            configurationClient: new ConfigurationClient(),
            userClient: new UserClient(baseUrl)
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

async function getProducingDeviceSmartMeterRead(
    deviceId: string,
    conf: Configuration.Entity
): Promise<number> {
    const device = await new ProducingDevice.Entity(deviceId, conf).sync();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parseInt((device.lastSmartMeterReadWh as any) as string, 10);
}

async function saveProducingDeviceSmartMeterRead(
    meterReading: number,
    deviceId: string,
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

    let device;

    try {
        device = await new ProducingDevice.Entity(deviceId, conf).sync();
        await device.saveSmartMeterRead(meterReading, '', timestamp);
        device = await device.sync();
        conf.logger.verbose(
            `Producing device ${deviceId} smart meter reading saved: ${meterReading}`
        );
    } catch (e) {
        conf.logger.error(`Could not save smart meter reading for producing device\n${e}`);

        console.error({
            deviceId: device.id,
            meterReading,
            time: moment.unix(timestamp).format(),
            smpk: smartMeterPrivateKey
        });
    }

    console.log('-----------------------------------------------------------\n');
}

const { device } = workerData;

const currentTime = moment.tz(device.timezone);

(async () => {
    const marketContractLookupAddress = await getMarketContractLookupAddress();
    const conf = await getDeviceConf(marketContractLookupAddress);

    const MOCK_READINGS_MINUTES_INTERVAL =
        parseInt(process.env.SOLAR_SIMULATOR_PAST_READINGS_MINUTES_INTERVAL, 10) || 15;

    let measurementTime = currentTime
        .clone()
        .subtract(1, 'day')
        .startOf('day');

    while (measurementTime.isSameOrBefore(currentTime)) {
        const newMeasurementTime = measurementTime
            .clone()
            .add(MOCK_READINGS_MINUTES_INTERVAL, 'minute');

        const measurementTimeWithFixedYear = measurementTime
            .clone()
            .year(2015)
            .unix();
        const newMeasurementTimeWithFixedYear = newMeasurementTime
            .clone()
            .year(2015)
            .unix();

        const combinedMultiplierForMatchingRows = (workerData.DATA as any[])
            .filter((row: any) => {
                const rowTime = moment.tz(row[0], 'DD.MM.YYYY HH:mm', device.timezone).unix();

                return (
                    rowTime > measurementTimeWithFixedYear &&
                    rowTime <= newMeasurementTimeWithFixedYear
                );
            })
            .reduce((a, b) => a + parseFloat(b[1]), 0);

        const multiplier = combinedMultiplierForMatchingRows ?? 0;
        const energyGenerated = Math.round(device.maxCapacity * multiplier);

        const isValidMeterReading = energyGenerated > 0;

        if (isValidMeterReading) {
            try {
                const previousRead: number = await getProducingDeviceSmartMeterRead(
                    device.id,
                    conf
                );

                await saveProducingDeviceSmartMeterRead(
                    previousRead + energyGenerated,
                    device.id,
                    measurementTime.unix(),
                    device.smartMeterPrivateKey,
                    conf
                );
            } catch (error) {
                console.error(
                    `Error while trying to save meter read for device ${device.id}`,
                    error?.message
                );
            }
        }

        parentPort.postMessage(
            `[Device ID: ${device.id}]:${
                isValidMeterReading ? 'Saved' : 'Skipped'
            } Energy Read of: ${energyGenerated} Wh - [${measurementTime.format()}]`
        );

        measurementTime = newMeasurementTime;
    }
})();
