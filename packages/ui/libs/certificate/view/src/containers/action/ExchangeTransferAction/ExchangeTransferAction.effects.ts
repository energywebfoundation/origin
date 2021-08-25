import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedExchangeCertificates,
  useExchangeTransferCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useExchangeTransferActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactionPendingDispatch } from '../../../context';

export const useExchangeTransferActionPropsEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const setTxPending = useTransactionPendingDispatch();
  const { t } = useTranslation();
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleAddressChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRecipientAddress(event.target.value);
  };

  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const transferHandler = useExchangeTransferCertificateHandler(
    recipientAddress,
    resetIds,
    setTxPending
  );

  const actionLogic = useExchangeTransferActionLogic({
    selectedIds,
    exchangeCertificates,
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
    buttonDisabled,
    errorExists,
    errorText,
  };
};
