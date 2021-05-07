import { OriginEnvironment } from '@energyweb/origin-ui-shared-state';

export function isDeviceGridOperatorEnabled(environment: OriginEnvironment) {
  return environment?.DEVICE_PROPERTIES_ENABLED?.includes('GRID_OPERATOR');
}
