/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort, workerData } from 'worker_threads';

import moment from 'moment-timezone';
import * as Winston from 'winston';

import { ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { OffChainDataSource } from '@energyweb/origin-backend-client';
import { ISmartMeterRead } from '@energyweb/origin-backend-core';
import { bigNumberify, BigNumber } from 'ethers/utils';

async function getProducingDeviceSmartMeterRead(
    deviceId: string,
    conf: Configuration.Entity
): Promise<BigNumber> {
    const device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();

    return device.lastSmartMeterReadWh ?? bigNumberify(0);
}

async function saveProducingDeviceSmartMeterRead(
    deviceId: number,
    smartMeterReading: ISmartMeterRead,
    conf: Configuration.Entity
) {
    console.log('-----------------------------------------------------------');

    let device;

    try {
        device = await new ProducingDevice.Entity(deviceId, conf).sync();
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

        console.error({
            deviceId: device.id,
            meterReading: smartMeterReading.meterReading,
            time: moment.unix(smartMeterReading.timestamp).format()
        });
    }

    console.log('-----------------------------------------------------------\n');
}

const { device } = workerData;

const currentTime = moment.tz(device.timezone);

(async () => {
    const offChainDataSource = new OffChainDataSource(
        process.env.BACKEND_URL,
        Number(process.env.BACKEND_PORT)
    );

    const conf = {
        blockchainProperties: {},
        offChainDataSource,
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        })
    };

    const MOCK_READINGS_MINUTES_INTERVAL =
        parseInt(process.env.SOLAR_SIMULATOR_PAST_READINGS_MINUTES_INTERVAL, 10) || 15;

    let measurementTime = currentTime.clone().subtract(1, 'day').startOf('day');

    while (measurementTime.isSameOrBefore(currentTime)) {
        const newMeasurementTime = measurementTime
            .clone()
            .add(MOCK_READINGS_MINUTES_INTERVAL, 'minute');

        const measurementTimeWithFixedYear = measurementTime.clone().year(2015).unix();
        const newMeasurementTimeWithFixedYear = newMeasurementTime.clone().year(2015).unix();

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
        const energyGenerated = bigNumberify(Math.round(device.maxCapacity * multiplier));

        const isValidMeterReading = energyGenerated.gt(0);

        if (isValidMeterReading) {
            try {
                const previousRead: BigNumber = bigNumberify(
                    await getProducingDeviceSmartMeterRead(device.id, conf)
                );

                const smartMeterReading: ISmartMeterRead = {
                    meterReading: previousRead.add(energyGenerated),
                    timestamp: measurementTime.unix()
                };

                await saveProducingDeviceSmartMeterRead(device.id, smartMeterReading, conf);
            } catch (error) {
                conf.logger.error(`Error while trying to save meter read for device ${device.id}`);
                if (error?.response?.data) {
                    conf.logger.error('HTTP Error', {
                        config: error.config,
                        response: error?.response?.data
                    });
                } else {
                    conf.logger.error(`ERROR: ${error?.message}`);
                }
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
