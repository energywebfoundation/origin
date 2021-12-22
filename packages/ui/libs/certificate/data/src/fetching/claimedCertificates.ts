import { useTransferControllerGetMyClaimTransfers } from '@energyweb/exchange-react-query-client';
import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useCachedUser } from '../cached';
import { useAllBlockchainCertificates } from './blockchainCertificates';

export const useApiClaimedCertificates = () => {
  const user = useCachedUser();
  const userHasBlockchainAccountAttached = Boolean(
    user?.organization?.blockchainAccountAddress
  );

  const {
    blockchainCertificates,
    isLoading: areAllBlockchainCertificatesLoading,
  } = useAllBlockchainCertificates();
  const { data: claimedFromExchange, isLoading: areExchangeClaimedLoading } =
    useTransferControllerGetMyClaimTransfers({
      query: {
        enabled: !userHasBlockchainAccountAttached,
      },
    });

  const claimedCertificates: CertificateDTO['myClaims'] =
    claimedFromExchange?.map((cert) => ({
      id: parseInt(cert.asset.tokenId),
      from: cert.address,
      to: cert.address,
      topic: cert.asset.tokenId,
      value: cert.amount,
      claimData: cert.claimData,
    })) ?? [];

  blockchainCertificates?.forEach(
    (certificate) =>
      certificate.claims.length > 0 &&
      claimedCertificates.push(...certificate.myClaims)
  );

  return {
    claimedCertificates,
    blockchainCertificates,
    isLoading: areAllBlockchainCertificatesLoading || areExchangeClaimedLoading,
  };
};
