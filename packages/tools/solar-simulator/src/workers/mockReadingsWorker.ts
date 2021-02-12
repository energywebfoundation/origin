/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort, workerData } from 'worker_threads';

import moment from 'moment-timezone';
import * as Winston from 'winston';

import { ProducingDevice, Configuration } from '@energyweb/device-registry';
import { AuthClient, Configuration as ClientConfiguration } from '@energyweb/origin-backend-client';
import { ISmartMeterRead } from '@energyweb/origin-backend-core';
import { BigNumber } from 'ethers';
import { DeviceClient } from '@energyweb/origin-device-registry-irec-form-api-client';

async function getProducingDeviceSmartMeterRead(
    deviceId: string,
    conf: Configuration.Entity
): Promise<BigNumber> {
    const device = await new ProducingDevice.Entity(parseInt(deviceId, 10), conf).sync();

    const smartMeterReadings = await device.getSmartMeterReads();
    const latestSmRead = smartMeterReadings[smartMeterReadings.length - 1];

    return BigNumber.from(latestSmRead?.meterReading ?? 0);
}

async function saveProducingDeviceSmartMeterReads(
    deviceId: number,
    smartMeterReadings: ISmartMeterRead[],
    conf: Configuration.Entity
) {
    console.log('-----------------------------------------------------------');

    let device;

    try {
        device = await new ProducingDevice.Entity(deviceId, conf).sync();
        await device.saveSmartMeterReads(smartMeterReadings);
        device = await device.sync();
        conf.logger.verbose(
            `Producing device ${deviceId} smart meter readings saved: ${JSON.stringify(
                smartMeterReadings.length
            )}`
        );
    } catch (e) {
        conf.logger.error(`Could not save smart meter readings for producing device\n${e}`);

        console.error({
            deviceId: device.id,
            smartMeterReadings
        });
    }

    console.log('-----------------------------------------------------------\n');
}

const { device } = workerData;

const currentTime = moment.tz(device.timezone);

(async () => {
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
        logger: Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        }),
        deviceClient: new DeviceClient(clientConfiguration, backendUrl)
    };

    const MOCK_READINGS_MINUTES_INTERVAL =
        parseInt(process.env.SOLAR_SIMULATOR_PAST_READINGS_MINUTES_INTERVAL, 10) || 15;

    let measurementTime = currentTime.clone().subtract(1, 'day').startOf('day');
    let currentMeterRead = BigNumber.from(await getProducingDeviceSmartMeterRead(device.id, conf));

    const allSmartMeterReadings: ISmartMeterRead[] = [];

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
        const energyGenerated = BigNumber.from(Math.round(device.maxCapacity * multiplier));

        const isValidMeterReading = energyGenerated.gt(0);

        if (isValidMeterReading) {
            const newMeterReading = currentMeterRead.add(energyGenerated);

            allSmartMeterReadings.push({
                meterReading: newMeterReading,
                timestamp: measurementTime.unix()
            });

            currentMeterRead = newMeterReading;
        }

        measurementTime = newMeasurementTime;
    }

    try {
        await saveProducingDeviceSmartMeterReads(device.id, allSmartMeterReadings, conf);
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

    parentPort.postMessage(
        `[Device ID: ${device.id}]: Saved ${allSmartMeterReadings.length} smart meter reads`
    );
})();
