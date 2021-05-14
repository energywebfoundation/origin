import {
  ComposedPublicDevice,
  ComposedDevice,
} from '@energyweb/origin-ui-device-data';

export const getDeviceMainType = (
  device: ComposedPublicDevice | ComposedDevice
) => {
  return device.deviceType.split(';')[0];
};

export const getDeviceDetailedType = (
  device: ComposedPublicDevice | ComposedDevice
) => {
  const arr = device.deviceType.split(';');
  arr.shift();
  return arr.length > 1 ? arr.join(' - ') : arr[0];
};
