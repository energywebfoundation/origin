import {
  DetailedCertificate,
  useExchangeAddress,
} from '@energyweb/origin-ui-certificate-data';
import {
  useCertificateBlockchainEventsLogic,
  useCertificateDataLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { useTranslation } from 'react-i18next';
import { useCertificateAppEnv } from '../../../context';

export const useCertificateDetailsEffects = (
  certificate: DetailedCertificate
) => {
  const { exchangeAddress, isLoading } = useExchangeAddress();
  const { exchangeWalletPublicKey } = useCertificateAppEnv();
  const { t } = useTranslation();

  const certificateData = useCertificateDataLogic(certificate);
  const eventsData = useCertificateBlockchainEventsLogic(
    certificate,
    exchangeAddress,
    exchangeWalletPublicKey
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
