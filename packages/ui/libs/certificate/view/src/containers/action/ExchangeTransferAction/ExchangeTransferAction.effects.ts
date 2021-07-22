import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedExchangeCertificates,
  useExchangeTransferCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useExchangeTransferActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';

export const useExchangeTransferActionPropsEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
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
    resetIds
  );

  const actionLogic = useExchangeTransferActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !recipientAddress;

  return {
    ...actionLogic,
    recipientAddress,
    handleAddressChange,
    transferHandler,
    buttonDisabled,
  };
};
