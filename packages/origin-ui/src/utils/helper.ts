import { Moment } from 'moment';
import { LocationService } from '@energyweb/utils-general';
import { Device } from '@energyweb/device-registry';

export const isOffChainProperty = (name: string, offChainProps: any): boolean => {
    for (const offChainPropName of Object.keys(offChainProps)) {
        if (offChainPropName === name) {
            return true;
        }
    }

    return false;
};

export const getOffChainText = (name: string, offChainProps: any): string => {
    return isOffChainProperty(name, offChainProps) ? ' (private)' : '';
};

export function dataTest(value, name = 'data-test') {
    return {
        [name]: value
    };
}

export function dataTestSelector(value, name = 'data-test') {
    return `[${name}="${value}"]`;
}

export function getPropertyByPath(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj || self);
}

export function deepEqual(a: any, b: any) {
    if (typeof a !== typeof b) {
        return false;
    }

    if (typeof a === 'object') {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    return a === b;
}

export function getEnumValues(enumeration) {
    const enumObject = Object.keys(enumeration);

    return enumObject.splice(Math.ceil(enumObject.length / 2), enumObject.length - 1);
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

export function formatCurrency(value: number) {
    return currencyFormatter.format(value).replace('$', '');
}

export function deduplicate(inputArray: any[]) {
    return inputArray.filter(
        (item, index, array) =>
            array.map(nestedItem => JSON.stringify(nestedItem)).indexOf(JSON.stringify(item)) ===
            index
    );
}

export function reverse(array: any[]) {
    return array.map((item, idx) => array[array.length - 1 - idx]);
}

export function clone(item: any) {
    return JSON.parse(JSON.stringify(item));
}

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const DATE_FORMAT_DMY = 'MMMM Do, YYYY';

export function formatDate(date: Moment) {
    return date.format(DATE_FORMAT_DMY);
}

const locationService = new LocationService();

export const LOCATION_TITLE = 'Region, province';

export function getDeviceLocationText(device: Device.Entity) {
    try {
        const decodedLocation = locationService.decode([
            locationService.translateAddress(
                device.offChainProperties.address,
                device.offChainProperties.country
            )
        ])[0];

        return decodedLocation.slice(1, 3).join(', ');
    } catch (error) {
        console.warn(
            `Can't parse location of device with id: ${device.id}.`,
            {
                address: device?.offChainProperties?.address
            },
            error
        );

        return 'Unknown';
    }
}
