import { IEnvironment } from './../types';

export function isDeviceLocationEnabled(environment: IEnvironment) {
  return environment?.DEVICE_PROPERTIES_ENABLED?.includes('LOCATION');
}
