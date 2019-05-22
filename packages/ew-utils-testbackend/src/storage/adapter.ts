export interface IAdapter {
    initialize(): Promise<any>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<any>;
}

export class Adapter implements IAdapter {
    async get(key: string) {
        throw new Error('Method not implemented.');
    }

    async set(key: string, value: any) {
        throw new Error('Method not implemented.');
    }

    async initialize() {}
}
