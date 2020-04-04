import { ProducingDevice } from '@energyweb/device-registry';
import { useRef, useEffect } from 'react';

export function dataTest(value, name = 'data-test') {
    return {
        [name]: value
    };
}

export function dataTestSelector(value, name = 'data-test') {
    return `[${name}="${value}"]`;
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

export function getEnumValues<T>(enumeration: T) {
    const enumObject = Object.keys(enumeration);

    return enumObject.splice(Math.ceil(enumObject.length / 2), enumObject.length - 1);
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

export function formatCurrency(value: number | string) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    return currencyFormatter.format(value).replace('$', '');
}

export function deduplicate(inputArray: any[]) {
    return inputArray.filter(
        (item, index, array) =>
            array.map((nestedItem) => JSON.stringify(nestedItem)).indexOf(JSON.stringify(item)) ===
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
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const LOCATION_TITLE_TRANSLATION_KEY = 'device.properties.regionProvince';

export function getDeviceLocationText(device: ProducingDevice.Entity) {
    return [device?.region, device?.province].filter((i) => i).join(', ');
}

export const countDecimals = (value) => (value % 1 ? value.toString().split('.')[1].length : 0);

export function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}
