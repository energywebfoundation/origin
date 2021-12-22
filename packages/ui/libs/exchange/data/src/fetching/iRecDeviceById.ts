import { AssetDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  PublicDeviceDTO,
  useDeviceControllerGet,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const useApiGetIRecDeviceById = (
  deviceId: AssetDTO['deviceId'],
  enabled: boolean
) => {
  const { data, isLoading } = useDeviceControllerGet(deviceId, {
    query: { enabled },
  });
  const device = data || ({} as PublicDeviceDTO);
  return { device, isLoading };
};
