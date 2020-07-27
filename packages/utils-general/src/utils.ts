/* eslint-disable no-restricted-globals */
export function getEnumValues<T extends Record<string, any>>(enumeration: T): Array<T[keyof T]> {
    return Object.keys(enumeration)
        .filter((k) => isNaN(Number(k)))
        .map((k) => enumeration[k]);
}
