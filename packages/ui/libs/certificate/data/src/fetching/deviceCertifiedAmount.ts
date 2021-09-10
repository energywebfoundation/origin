import { useIrecCertificateControllerGetAggregateCertifiedEnergyByDeviceId } from '@energyweb/issuer-irec-api-react-query-client';
import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';

export const useCertifiedAmountForDevice = (
  id: OriginDeviceDTO['externalRegistryId']
) => {
  const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const end = new Date(new Date().getFullYear(), 11, 31).toISOString();

  const {
    data: certifiedAmount,
    isLoading: isCertifiedLoading,
  } = useIrecCertificateControllerGetAggregateCertifiedEnergyByDeviceId(
    id,
    { start, end },
    {
      enabled: !!id,
    }
  );

  return { certifiedAmount, isCertifiedLoading };
};
