import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';

export const getDeviceLocationText = (device: DeviceDTO) =>
  [device?.region, device?.province].filter((i) => i).join(', ');
