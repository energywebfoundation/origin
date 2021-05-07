import { OriginEnvironment } from '@energyweb/origin-ui-shared-state';

export function isDeviceLocationEnabled(environment: OriginEnvironment) {
  return environment?.DEVICE_PROPERTIES_ENABLED?.includes('LOCATION');
}
