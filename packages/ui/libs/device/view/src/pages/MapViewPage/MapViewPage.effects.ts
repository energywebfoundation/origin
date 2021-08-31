import { useApiAllDevices } from '@energyweb/origin-ui-device-data';
import { useDeviceAppEnv } from '../../context';

export const useMapViewPageEffects = () => {
  const { allDevices, isLoading } = useApiAllDevices();
  const { googleMapsApiKey } = useDeviceAppEnv();

  return { allDevices, isLoading, googleMapsApiKey };
};
