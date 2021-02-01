import { Connection } from './connection';
import { Registration } from './registration';

export * from './app.module';
export * from './registration';
export * from './connection';

export const entities = [Registration, Connection];
