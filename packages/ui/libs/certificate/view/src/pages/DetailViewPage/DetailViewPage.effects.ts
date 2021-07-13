import { useCertificateDetailedData } from '@energyweb/origin-ui-certificate-data';
import { useParams } from 'react-router';

export const useDetailedPageViewEffects = () => {
  const { id } = useParams();

  const { certificate, isLoading } = useCertificateDetailedData(id);

  return { certificate, isLoading };
};
