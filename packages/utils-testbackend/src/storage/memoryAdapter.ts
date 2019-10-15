import { Adapter } from './adapter';
import { STATUS_CODES } from '../enums/StatusCodes';

export class MemoryAdapter extends Adapter {
    _storage: any = {};

    get(key: string): any {
        return this._storage[key];
    }

    async set(key: string, value: string) {
        this._storage[key] = value;
    }
}
