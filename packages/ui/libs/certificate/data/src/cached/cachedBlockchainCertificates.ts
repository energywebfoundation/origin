import {
  CertificateDTO,
  getIrecCertificateControllerGetAllQueryKey,
} from '@energyweb/issuer-irec-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedBlockchainCertificates = () => {
  const queryClient = useQueryClient();
  const blockchainCertificatesQueryKey =
    getIrecCertificateControllerGetAllQueryKey();

  return queryClient.getQueryData<CertificateDTO[]>(
    blockchainCertificatesQueryKey
  );
};
