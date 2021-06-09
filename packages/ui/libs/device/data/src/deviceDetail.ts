import { useCertificateControllerGetAggregateCertifiedEnergyByDeviceId } from '@energyweb/issuer-api-react-query-client';
import { useOrganizationControllerGet } from '@energyweb/origin-backend-react-query-client';
import {
  OriginDeviceDTO,
  useDeviceRegistryControllerGet,
} from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerGet } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { composePublicDevices } from './utils';

const useDeviceOwnerName = (id: OriginDeviceDTO['owner']) => {
  const { data: organization, isLoading: isOrgLoading } =
    useOrganizationControllerGet(Number(id), {
      enabled: !!id,
    });
  const ownerName = organization?.name;
  return { isOrgLoading, ownerName };
};

const useCertifiedAmountForDevice = (
  id: OriginDeviceDTO['externalRegistryId']
) => {
  const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const end = new Date(new Date().getFullYear(), 11, 31).toISOString();
  const { data: certifiedAmount, isLoading: isCertifiedLoading } =
    useCertificateControllerGetAggregateCertifiedEnergyByDeviceId(
      id,
      { start, end },
      {
        enabled: !!id,
      }
    );

  return { certifiedAmount, isCertifiedLoading };
};

export const useDeviceDetailData = (id: OriginDeviceDTO['id']) => {
  const { data: originDevice, isLoading: isOriginDeviceLoading } =
    useDeviceRegistryControllerGet(id);

  const { data: iRecDevice, isLoading: isIRecDeviceLoading } =
    useDeviceControllerGet(originDevice?.externalRegistryId, {
      enabled: !!originDevice?.externalRegistryId,
    });

  const { ownerName, isOrgLoading } = useDeviceOwnerName(originDevice?.owner);

  const { certifiedAmount, isCertifiedLoading } = useCertifiedAmountForDevice(
    originDevice?.externalRegistryId
  );

  const isLoading =
    isOriginDeviceLoading ||
    isIRecDeviceLoading ||
    isOrgLoading ||
    isCertifiedLoading;
  const device =
    !isLoading && composePublicDevices([originDevice], [iRecDevice])[0];

  return { device, ownerName, certifiedAmount, isLoading };
};
