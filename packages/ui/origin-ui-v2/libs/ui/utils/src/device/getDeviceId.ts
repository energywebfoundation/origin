import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';
import { IEnvironment } from '../types';

export const getDeviceId = (device: DeviceDTO, environment: IEnvironment) =>
  device.externalDeviceIds?.find((i) => i.type === environment.ISSUER_ID)?.id ??
  String(device.id);
