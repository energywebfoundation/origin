import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useAllBlockchainCertificates } from './blockchainCertificates';

export const useClaimedCertificates = () => {
  const { blockchainCertificates, isLoading } = useAllBlockchainCertificates();

  const claimedCertificates: CertificateDTO['myClaims'] = [];

  blockchainCertificates?.forEach(
    (certificate) =>
      certificate.claims.length > 0 &&
      claimedCertificates.push(...certificate.myClaims)
  );

  return { claimedCertificates, blockchainCertificates, isLoading };
};
