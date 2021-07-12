import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedBlockchainCertificates,
  useTransferCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useTransferActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';

export const useTransferActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleAddressChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRecipientAddress(event.target.value);
  };

  const blockchainCertificates = useCachedBlockchainCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const { transferHandler, isLoading } = useTransferCertificateHandler(
    recipientAddress,
    resetIds
  );

  const actionLogic = useTransferActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  return {
    ...actionLogic,
    recipientAddress,
    handleAddressChange,
    transferHandler,
    isLoading,
  };
};
