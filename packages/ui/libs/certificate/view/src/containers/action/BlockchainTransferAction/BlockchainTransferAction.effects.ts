import {
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCachedBlockchainCertificates,
  useBlockchainTransferCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useBlockchainTransferActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';

export const useBlockchainTransferActionEffects = <Id>(
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

  const { transferHandler, isLoading } =
    useBlockchainTransferCertificateHandler(recipientAddress, resetIds);

  const actionLogic = useBlockchainTransferActionLogic({
    selectedIds,
    blockchainCertificates,
    allDevices,
    allFuelTypes,
  });

  const buttonDisabled = !recipientAddress;

  return {
    ...actionLogic,
    recipientAddress,
    handleAddressChange,
    transferHandler,
    isLoading,
    buttonDisabled,
  };
};
