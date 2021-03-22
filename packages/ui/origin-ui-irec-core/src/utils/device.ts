import { IEnvironment } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice, ComposedDevice } from '../types';

export function isDeviceLocationEnabled(environment: IEnvironment) {
    return environment?.DEVICE_PROPERTIES_ENABLED?.includes('LOCATION');
}

export function isDeviceGridOperatorEnabled(environment: IEnvironment) {
    return environment?.DEVICE_PROPERTIES_ENABLED?.includes('GRID_OPERATOR');
}

type TDeviceColumn<T extends any> = {
    id: 'deviceLocation' | 'gridOperator';
    label: string;
    sortProperties?: ((record: T) => string)[];
};

export function getDeviceColumns<T extends any>(
    environment: IEnvironment,
    t: (string) => string,
    locationSortProperties?: ((T) => string)[],
    gridOperatorSortProperties?: ((T) => string)[]
) {
    const columns: TDeviceColumn<T>[] = [];

    if (isDeviceLocationEnabled(environment)) {
        columns.push({
            id: 'deviceLocation',
            label: t('device.properties.regionProvince'),
            sortProperties: locationSortProperties
        });
    }

    if (isDeviceGridOperatorEnabled(environment)) {
        columns.push({
            id: 'gridOperator',
            label: t('device.properties.gridOperator'),
            sortProperties: gridOperatorSortProperties
        });
    }

    return columns;
}

export function getDeviceLocationText(device: ComposedDevice | ComposedPublicDevice) {
    return [device.countryCode, device.address].filter((i) => i).join(', ');
}

export function getDeviceGridOperatorText(device: ComposedDevice | ComposedPublicDevice) {
    return device?.gridOperator?.split(';')?.join(' ') || '';
}
