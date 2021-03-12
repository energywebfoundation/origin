import { BigNumber } from 'ethers';
import { Unit } from '@energyweb/utils-general';
import { EnergyFormatter, EnergyTypes } from '@energyweb/origin-ui-core';
import { Bundle } from './exchange';
import { deviceById } from './device';
import { IEnvironment } from '../features/general';

export const energyByType = (
    bundle: Bundle,
    devices,
    types: EnergyTypes[] = Object.values(EnergyTypes),
    environment: IEnvironment
) => {
    return bundle.items.reduce(
        (grouped, item) => {
            const device = deviceById(item.asset.deviceId, devices, environment);
            const type = device
                ? (device.deviceType.split(';')[0].toLowerCase() as EnergyTypes)
                : EnergyTypes.SOLAR;
            const propName = grouped[type] ? type : 'other';
            grouped[propName] = grouped[propName].add(item.currentVolume);
            grouped.total = grouped.total.add(item.currentVolume);
            return grouped;
        },
        types.reduce((acc, type) => ({ ...acc, [type]: BigNumber.from(0) }), {
            total: BigNumber.from(0),
            other: BigNumber.from(0)
        })
    );
};

export const energyShares = (
    bundle: Bundle,
    devices,
    types: EnergyTypes[],
    environment: IEnvironment
) => {
    const energy = energyByType(bundle, devices, types, environment);
    return Object.fromEntries(
        Object.keys(energy)
            .filter((p) => p !== 'total')
            .map((p) => [p, energy[p].mul(BigNumber.from(10000)).div(energy.total)])
            .map(([p, v]) => {
                return [p, `${(v.toNumber() / 100).toFixed(2)}%`];
            })
            .concat([['total', EnergyFormatter.format(energy.total, true)]])
    );
};

/**
 * Unformatted price
 *
 * @param
 */
export const bundlePrice = ({ volume, price }: Partial<Bundle>) =>
    (price * volume.toNumber()) / (Unit[EnergyFormatter.displayUnit] * 100);
