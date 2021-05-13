import { useAllDevices } from '@energyweb/origin-ui-device-data';

export const useAllDevicesPageEffects = () => {
  const allDevices = useAllDevices();

  return { allDevices };
};
