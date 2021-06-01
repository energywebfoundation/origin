import { Connection } from './connection';
import { Registration } from './registration';
import { Beneficiary } from './beneficiary';

export * from './app.module';
export * from './beneficiary';
export * from './connection';
export * from './irec';
export * from './registration';

export const entities = [Registration, Connection, Beneficiary];
