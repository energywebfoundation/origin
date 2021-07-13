import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  CertificateDTO,
  CertificateEvent,
  FullCertificationRequestDTO,
  useCertificationRequestControllerGetByCertificate,
  useIrecCertificateControllerGet,
  useIrecCertificateControllerGetAllEvents,
} from '@energyweb/issuer-irec-api-react-query-client';
import { useApiAllExchangeCertificates } from './exchangeCertificates';

export type DetailedCertificate = {
  blockchainPart: CertificateDTO;
  exchangePart: AccountAssetDTO;
  events: CertificateEvent[];
  requestPart: FullCertificationRequestDTO;
};

export const useCertificateDetailedData = (id: string) => {
  const { exchangeCertificates, isLoading: areExchangeCertificateLoading } =
    useApiAllExchangeCertificates();

  const exchangeCertificate = exchangeCertificates.find(
    (certificate) => certificate.asset.tokenId === id
  );

  const {
    data: blockchainCertificate,
    isLoading: isBlockchainCertificateLoading,
  } = useIrecCertificateControllerGet(parseInt(id));

  const { data: blockchainEvents, isLoading: areEventsLoading } =
    useIrecCertificateControllerGetAllEvents(parseInt(id));

  const { data: certificateRequest, isLoading: isCertificateRequestLoading } =
    useCertificationRequestControllerGetByCertificate(parseInt(id));

  const certificate: DetailedCertificate = {
    blockchainPart: {
      ...blockchainCertificate,
    },
    exchangePart: {
      ...exchangeCertificate,
    },
    events: blockchainEvents,
    requestPart: {
      ...certificateRequest,
    },
  };

  const isLoading =
    areExchangeCertificateLoading ||
    isBlockchainCertificateLoading ||
    areEventsLoading ||
    isCertificateRequestLoading;

  return { certificate, isLoading };
};
