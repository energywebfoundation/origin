import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedMyDevices,
  useSellCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useSellActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';

export const useSellActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const [price, setPrice] = useState('');

  const handlePriceChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPrice(event.target.value);
  };

  const exchangeCertificates = useCachedExchangeCertificates();
  const myDevices = useCachedMyDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const sellHandler = useSellCertificateHandler(
    price,
    exchangeCertificates,
    resetIds
  );

  const actionLogic = useSellActionLogic({
    selectedIds,
    exchangeCertificates,
    myDevices,
    allFuelTypes,
  });

  return { ...actionLogic, price, handlePriceChange, sellHandler };
};
