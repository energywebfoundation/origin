import * as Winston from 'winston';
import { Listener } from './interface/Listener';

export class EntityListener<T> {
    private listeners: Listener<T>[] = [];

    constructor(private logger: Winston.Logger) {}

    public register(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    public trigger(entity: T) {
        for (const listener of this.listeners) {
            try {
                listener(entity);
            } catch (e) {
                this.logger.error(`Certificate listener failed to execute: ${e} ${e.stack}`);
            }
        }
    }
}
