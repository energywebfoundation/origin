import { entities as OriginBackendEntities } from '@energyweb/origin-backend';

import { Connection } from './connection';
import { Registration } from './registration';
import { Beneficiary } from './beneficiary';

export * from './app.module';
export * from './beneficiary';
export * from './connection';
export * from './irec';
export * from './registration';

export const usedEntities = OriginBackendEntities;
export const entities = [Registration, Connection, Beneficiary, ...usedEntities];
