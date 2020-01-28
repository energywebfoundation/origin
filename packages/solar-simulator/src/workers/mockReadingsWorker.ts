import { parentPort, workerData } from 'worker_threads';

import moment from 'moment-timezone';
import Web3 from 'web3';
import * as Winston from 'winston';

import { ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { createBlockchainProperties } from '@energyweb/market';
import { OffChainDataSource, IOffChainDataSource } from '@energyweb/origin-backend-client';

const web3 = new Web3(process.env.WEB3);

async function getMarketContractLookupAddress(offChainDataSource: IOffChainDataSource) {
    let storedMarketContractAddresses: string[] = [];

    console.log(`[SIMULATOR-MOCK-READINGS] Trying to get Market contract address`);

    while (storedMarketContractAddresses.length === 0) {
        storedMarketContractAddresses = await offChainDataSource.configurationClient.get(
            'MarketContractLookup'
        );

        if (storedMarketContractAddresses.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    const storedMarketContractAddress = storedMarketContractAddresses.pop();

    return process.env.MARKET_CONTRACT_ADDRESS || storedMarketContractAddress;
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
const measurementTime = currentTime
    .clone()
    .subtract(1, 'day')
    .startOf('day');

(async () => {
    const offChainDataSource = new OffChainDataSource(`${process.env.BACKEND_URL}/api`);

    const conf = {
        blockchainProperties: {
            web3
        },
        offChainDataSource,
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };

    const marketContractLookupAddress = await getMarketContractLookupAddress(offChainDataSource);

    conf.blockchainProperties = await createBlockchainProperties(
        conf.blockchainProperties.web3,
        marketContractLookupAddress
    );

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
                console.error(`Error while trying to save meter read for device ${device.id}`);
            }
        }

        parentPort.postMessage(
            `[Device ID: ${device.id}]:${
                isValidMeterReading ? 'Saved' : 'Skipped'
            } Energy Read of: ${energyGenerated} Wh - [${measurementTime.format()}]`
        );

        measurementTime.add(15, 'minute');
    }
})();
