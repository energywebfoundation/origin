import { entities as BackendEntities } from '@energyweb/origin-backend';
import { entities as IrecOrganizationEntities } from '@energyweb/origin-organization-irec-api';
import { Device } from './device';

export * from './device';
export * from './app.module';

export const entities = [Device];
export const usedEntities = [...BackendEntities, ...IrecOrganizationEntities];
