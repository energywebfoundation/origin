import { useCertificateDetailedData } from '@energyweb/origin-ui-certificate-data';
import { useDeviceByExternalRegistryId } from '@energyweb/origin-ui-certificate-data';
import { useParams } from 'react-router';

export const useDetailedPageViewEffects = () => {
  const { id } = useParams();

  const {
    certificate,
    isLoading: isCertificateLoading,
  } = useCertificateDetailedData(id);
  const { device, isLoading: isDeviceLoading } = useDeviceByExternalRegistryId(
    certificate?.blockchainPart?.deviceId
  );

  const isLoading = isCertificateLoading || isDeviceLoading;

  return { certificate, isLoading, device };
};
