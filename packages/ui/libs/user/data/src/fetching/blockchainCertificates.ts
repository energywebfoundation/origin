import { useIrecCertificateControllerGetAll } from '@energyweb/issuer-irec-api-react-query-client';

export const useAllBlockchainCertificates = () => {
  const { data: blockchainCertificates, isLoading } =
    useIrecCertificateControllerGetAll();

  return { blockchainCertificates, isLoading };
};
