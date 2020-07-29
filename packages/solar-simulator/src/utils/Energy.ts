import moment from 'moment-timezone';
import { IEnergyGenerated } from '@energyweb/origin-backend-core';

import { BigNumber } from 'ethers';
import { IGeneratingDevice } from './GeneratingDevice';

type TableRowType = string[3];

export enum ENERGY_UNIT {
    joule = 'joule',
    wattHour = 'wattHour',
    kilowattHour = 'kilowattHour',
    megawattHour = 'megawattHour',
    gigawattHour = 'gigawattHour'
}

export const ENERGY_UNIT_TO_RATIO_MAPPING = {
    [ENERGY_UNIT.joule]: 3600,
    [ENERGY_UNIT.wattHour]: 1,
    [ENERGY_UNIT.kilowattHour]: 0.001,
    [ENERGY_UNIT.megawattHour]: 1e-6,
    [ENERGY_UNIT.gigawattHour]: 1e-9
};

export function getEnergyFromCSVRows(
    rows: TableRowType[],
    device: IGeneratingDevice,
    timeStart: moment.Moment,
    timeEnd: moment.Moment,
    accumulated = false
): IEnergyGenerated[] {
    const parsedRows: IEnergyGenerated[] = [];
    const currentYear = moment().year();

    function calculateRowEnergy(ratio: string): BigNumber {
        const maxCapacityInDeviceUnit =
            device.maxCapacity * ENERGY_UNIT_TO_RATIO_MAPPING[device.energy_unit];

        return BigNumber.from(Math.round(parseFloat(ratio) * maxCapacityInDeviceUnit));
    }

    function checkTimeInBounds(time: moment.Moment) {
        let include = true;

        if (timeStart) {
            include = time.unix() >= timeStart.unix();
        }

        if (timeEnd && include) {
            include = time.unix() <= timeEnd.unix();
        }

        return include;
    }

    function parseRowTime(timeString: string): moment.Moment {
        return moment.tz(timeString, 'DD.MM.YYYY HH:mm', device.timezone).year(currentYear);
    }

    if (accumulated) {
        parsedRows.push({
            energy: BigNumber.from(0),
            timestamp: 0
        });

        for (let i = 1; i < rows.length; i++) {
            const [timeString, ratio] = rows[i];
            const time = parseRowTime(timeString);

            if (!checkTimeInBounds(time)) {
                continue;
            }

            parsedRows[0].energy = parsedRows[0].energy.add(calculateRowEnergy(ratio));
            parsedRows[0].timestamp = time.unix();
        }
    } else {
        for (let i = 1; i < rows.length; i++) {
            const [timeString, ratio] = rows[i];
            const time = parseRowTime(timeString);

            if (!checkTimeInBounds(time)) {
                continue;
            }

            parsedRows.push({
                energy: calculateRowEnergy(ratio),
                timestamp: time.unix()
            });
        }
    }

    return parsedRows;
}
