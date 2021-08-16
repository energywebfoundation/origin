import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedBlockchainCertificates,
  useBlockchainTransferCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useBlockchainTransferActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useBlockchainTransferActionEffects = (
  selectedIds: CertificateDTO['id'][],
  resetIds: () => void
) => {
  const { t } = useTranslation();
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleAddressChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRecipientAddress(event.target.value);
  };

  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const { transferHandler, isLoading } =
    useBlockchainTransferCertificateHandler(recipientAddress, resetIds);

  const actionLogic = useBlockchainTransferActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !recipientAddress || recipientAddress.length !== 42;
  const errorExists = !!recipientAddress && recipientAddress.length !== 42;
  const errorText = t('certificate.inbox.enterValidAddress');

  return {
    ...actionLogic,
    recipientAddress,
    handleAddressChange,
    transferHandler,
    isLoading,
    buttonDisabled,
    errorExists,
    errorText,
  };
};
