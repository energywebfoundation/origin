import {
  IrecAccountItemDto,
  useImportControllerGetIrecCertificateToImport,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiCertificateToImport = () => {
  const { data, isLoading } = useImportControllerGetIrecCertificateToImport();

  const certificates = data ?? ([] as IrecAccountItemDto[]);

  return { certificates, isLoading };
};
