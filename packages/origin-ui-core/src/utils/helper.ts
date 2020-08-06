import { useRef, useEffect } from 'react';

export function deepEqual(a: any, b: any) {
    if (typeof a !== typeof b) {
        return false;
    }

    if (typeof a === 'object') {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    return a === b;
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

export const countDecimals = (value) => (value % 1 ? value.toString().split('.')[1].length : 0);

export function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });

    return ref.current;
}
