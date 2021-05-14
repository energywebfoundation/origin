import { originDeviceRegistryClient } from '@energy-web/origin-ui-api-clients';

export const useApiFetchAllDevices = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
    data,
  } = originDeviceRegistryClient.useDeviceRegistryControllerGetAll();
  return { isLoading, error, isError, isSuccess, status, data };
};
