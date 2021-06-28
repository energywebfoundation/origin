import { entities as BackendEntities } from '@energyweb/origin-backend';
import { entities as IrecOrganizationEntities } from '@energyweb/origin-organization-irec-api';
import { Device } from './device';

export * from './device';
export * from './utils';
export * from './app.module';

export const usedEntities = [...BackendEntities, ...IrecOrganizationEntities];
export const entities = [Device, ...usedEntities];
