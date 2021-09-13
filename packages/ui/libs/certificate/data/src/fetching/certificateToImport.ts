import { useIrecCertificateControllerGetIrecCertificateToImport } from '@energyweb/issuer-irec-api-react-query-client';

export const useApiCertificateToImport = () => {
  const { data: certificates, isLoading } =
    useIrecCertificateControllerGetIrecCertificateToImport();

  return { certificates, isLoading };
};
