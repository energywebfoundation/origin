import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedExchangeCertificates,
  useExchangeExportCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useExchangeExportActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactionPendingDispatch } from '../../../context';

export const useExchangeExportActionEffects = (
  selectedIds: AccountAssetDTO['asset']['id'][],
  resetIds: () => void
) => {
  const setTxPending = useTransactionPendingDispatch();
  const { t } = useTranslation();
  const [recipientTradeAccount, setRecipientTradeAccount] = useState('');

  const handleAddressChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRecipientTradeAccount(event.target.value);
  };

  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const transferHandler = useExchangeExportCertificateHandler(
    recipientTradeAccount,
    resetIds,
    setTxPending
  );

  const actionLogic = useExchangeExportActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !recipientTradeAccount;
  const errorExists = false;
  const errorText = t('certificate.inbox.enterValidId');

  return {
    ...actionLogic,
    recipientTradeAccount,
    handleAddressChange,
    transferHandler,
    buttonDisabled,
    errorExists,
    errorText,
  };
};
