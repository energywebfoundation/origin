import { useIrecCertificateControllerGetAll } from '@energyweb/issuer-irec-api-react-query-client';

export const useApiAllCertificates = () => {
  const { data: allCertificates, isLoading } =
    useIrecCertificateControllerGetAll();

  return { allCertificates, isLoading };
};
