import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';

export const getDeviceMainType = (device: DeviceDTO) => {
  return device.deviceType.split(';')[0];
};

export const getDeviceDetailedType = (device: DeviceDTO) => {
  const arr = device.deviceType.split(';');
  arr.shift();
  return arr.length > 1 ? arr.join(' - ') : arr[0];
};
