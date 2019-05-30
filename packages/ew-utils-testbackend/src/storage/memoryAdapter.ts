import { Adapter } from './adapter';
import { STATUS_CODES } from '../enums/StatusCodes';

export class MemoryAdapter extends Adapter {
    _storage = {};

    get(key) {
        return this._storage[key];
    }

    async set(key, value) {
        this._storage[key] = value;
    }

    async del(key) {
        this._storage[key] = STATUS_CODES.GONE;
    }
}
