import { useTransferControllerGetMyClaimTransfers } from '@energyweb/exchange-react-query-client';
import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useAllBlockchainCertificates } from './blockchainCertificates';

export const useApiClaimedCertificates = () => {
  const {
    blockchainCertificates,
    isLoading: areAllBlockchainCertificatesLoading,
  } = useAllBlockchainCertificates();
  const { data: claimedFromExchange, isLoading: areExchangeClaimedLoading } =
    useTransferControllerGetMyClaimTransfers();

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
