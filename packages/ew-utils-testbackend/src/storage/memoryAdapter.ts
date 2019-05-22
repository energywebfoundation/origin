import { Adapter } from './adapter';

export class MemoryAdapter extends Adapter {
    _storage = {};

    get(key) {
        return this._storage[key];
    }

    async set(key, value) {
        this._storage[key] = value;
    }
}
