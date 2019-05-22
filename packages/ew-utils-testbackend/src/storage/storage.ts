import { Entity } from '../entity';
import { IAdapter } from './adapter';

export class CustomStorage {
    _dataTypes: Entity[];
    _adapter: IAdapter = null;

    constructor(dataTypes: Entity[], adapter: IAdapter) {
        if (!adapter) {
            throw new Error('You need to initialize Storage with adapter');
        }

        this._adapter = adapter;
        this._dataTypes = dataTypes;
    }

    async initialize() {
        await this._adapter.initialize();

        this._dataTypes.forEach(type => {
            if (!this._adapter.get(type)) {
                this._adapter.set(type, []);
            }
        });
    }

    get(type: Entity, key: string) {
        if (arguments.length > 2) {
            throw new Error('Storage::get()::Too many arguments passed');
        }

        return this._adapter.get(type)[key];
    }

    set(type: Entity, key: string, value: any) {
        if (arguments.length < 3) {
            throw new Error('Storage::set()::Not enough arguments passed');
        }

        const existingData = this._adapter.get(type);

        return this._adapter.set(
            type,
            Object.assign({}, existingData, {
                [key]: value
            })
        );
    }
}
