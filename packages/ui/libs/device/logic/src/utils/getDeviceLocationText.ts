import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-react-query-client';

export const getDeviceLocationText = (device: DeviceDTO) =>
  [device?.region, device?.province].filter((i) => i).join(', ');
