export const groupBy = <T, K extends string | number | symbol>(
    arr: T[],
    by: (item: T) => K
): Record<K, T[]> => {
    const map = new Map<K, T[]>();

    arr.forEach((item) => {
        const key = by(item);
        const items = map.get(key) ?? [];

        map.set(key, items.concat(item));
    });

    const result = {} as Record<K, T[]>;

    for (const [key, value] of map.entries()) {
        result[key] = value;
    }

    return result;
};

export const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
    const truthyResult = [] as T[];
    const falsyResult = [] as T[];

    arr.forEach((item) => (predicate(item) ? truthyResult.push(item) : falsyResult.push(item)));

    return [truthyResult, falsyResult];
};
