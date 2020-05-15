export const omit = <T, K extends keyof T>(obj: T, ...fields: K[]): Partial<T> => {
    const copy = {
        ...obj
    };
    fields.forEach((field) => delete copy[field]);

    return copy;
};
