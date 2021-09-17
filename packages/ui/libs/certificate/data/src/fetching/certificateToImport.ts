import {
  IrecAccountItemDto,
  useIrecCertificateControllerGetIrecCertificateToImport,
} from '@energyweb/issuer-irec-api-react-query-client';

export const useApiCertificateToImport = () => {
  const { data, isLoading } =
    useIrecCertificateControllerGetIrecCertificateToImport();

  const certificates = data ?? ([] as IrecAccountItemDto[]);

  return { certificates, isLoading };
};
