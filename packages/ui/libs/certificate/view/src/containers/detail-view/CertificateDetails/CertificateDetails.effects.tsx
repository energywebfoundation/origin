import {
  DetailedCertificate,
  useExchangeAddress,
} from '@energyweb/origin-ui-certificate-data';
import {
  useCertificateBlockchainEventsLogic,
  useCertificateDataLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { useTranslation } from 'react-i18next';

export const useCertificateDetailsEffects = (
  certificate: DetailedCertificate
) => {
  const { exchangeAddress, isLoading } = useExchangeAddress();

  const { t } = useTranslation();

  const certificateData = useCertificateDataLogic(certificate);
  const eventsData = useCertificateBlockchainEventsLogic(
    certificate,
    exchangeAddress
  );

  const blockhainTransactionsTitle = t(
    'certificate.detailView.blockchainTransactions'
  );

  return {
    ...certificateData,
    isLoading,
    eventsData,
    blockhainTransactionsTitle,
  };
};
