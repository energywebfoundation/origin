// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

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

export function indexOfEnd(baseString: string, searchString: string) {
    const index = baseString.indexOf(searchString);

    return index === -1 ? -1 : index + searchString.length;
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