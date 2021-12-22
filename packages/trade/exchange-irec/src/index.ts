export * from './app.module';
export * from './demand';
export * from './export';
export * from './import';
export * from './order';
export * from './order-book';
export * from './product';
export * from './runner';
export * from './trade';
export * from './utils';

import { entities as IssuerIRECEntities } from '@energyweb/issuer-irec-api';
import { entities as DeviceRegistryEntities } from '@energyweb/origin-device-registry-api';
import { ExportedAsset } from './export/exported.entity';

export const entities = [ExportedAsset];
export const usedEntities = [...IssuerIRECEntities, ...DeviceRegistryEntities];
