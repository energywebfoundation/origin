const NOT_IMPLEMENTED = 'Method not implemented.';

export interface IAdapter {
    initialize(): Promise<any>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<any>;
}

export class Adapter implements IAdapter {
    async get(key: string) {
        throw new Error(NOT_IMPLEMENTED);
    }

    async set(key: string, value: any) {
        throw new Error(NOT_IMPLEMENTED);
    }

    async initialize() {}
}
