import { useIrecCertificateControllerGetAggregateCertifiedEnergyByDeviceId } from '@energyweb/issuer-irec-api-react-query-client';
import {
  OriginDeviceDTO,
  useDeviceRegistryControllerGet,
} from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGet } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composePublicDevices } from '../utils';

const useCertifiedAmountForDevice = (
  id: OriginDeviceDTO['externalRegistryId']
) => {
  const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const end = new Date(new Date().getFullYear(), 11, 31).toISOString();
  const { data: certifiedAmount, isLoading: isCertifiedLoading } =
    useIrecCertificateControllerGetAggregateCertifiedEnergyByDeviceId(
      id,
      { start, end },
      {
        query: {
          enabled: !!id,
        },
      }
    );

  return { certifiedAmount, isCertifiedLoading };
};

export const useDeviceDetailData = (id: OriginDeviceDTO['id']) => {
  const {
    data: originDevice,
    isLoading: isOriginDeviceLoading,
    isRefetching: isOriginDeviceRefetching,
  } = useDeviceRegistryControllerGet(id);

  const {
    data: iRecDevice,
    isLoading: isIRecDeviceLoading,
    isRefetching: isIRecDeviceRefetching,
  } = useDeviceControllerGet(originDevice?.externalRegistryId, {
    query: {
      enabled: !!originDevice?.externalRegistryId,
    },
  });

  const { certifiedAmount, isCertifiedLoading } = useCertifiedAmountForDevice(
    originDevice?.externalRegistryId
  );

  const isLoading =
    isOriginDeviceLoading || isIRecDeviceLoading || isCertifiedLoading;
  const isRefetching = isOriginDeviceRefetching || isIRecDeviceRefetching;
  const device =
    !isLoading && composePublicDevices([originDevice], [iRecDevice])[0];

  return { device, certifiedAmount, isLoading, isRefetching };
};
