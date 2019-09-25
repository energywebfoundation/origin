const NOT_IMPLEMENTED = 'Method not implemented.';

export interface IAdapter {
    initialize(): Promise<any>;

    get(key: string): any;
    set(key: string, value: any): any;
}

export class Adapter implements IAdapter {
    get(key: string) {
        throw new Error(NOT_IMPLEMENTED);
    }

    set(key: string, value: any) {
        throw new Error(NOT_IMPLEMENTED);
    }

    async initialize() {}
}
