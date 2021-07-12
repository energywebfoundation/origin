import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useAllBlockchainCertificates } from './blockchainCertificates';

export const useClaimedCertificates = () => {
  const { blockchainCertificates, isLoading } = useAllBlockchainCertificates();

  let claimedCertificates: CertificateDTO['claims'] = [];

  blockchainCertificates?.forEach(
    (certificate) =>
      certificate.claims.length > 0 &&
      claimedCertificates.push(...certificate.claims)
  );

  return { claimedCertificates, blockchainCertificates, isLoading };
};
