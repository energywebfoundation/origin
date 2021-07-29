import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useSellCertificateHandler,
} from '@energyweb/origin-ui-certificate-data';
import { useSellActionLogic } from '@energyweb/origin-ui-certificate-logic';
import { ChangeEvent, useState } from 'react';

export const useSellActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const [totalAmount, setTotalAmount] = useState<number>();
  const [price, setPrice] = useState('');

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const resetAction = () => {
    resetIds();
    setPrice('');
  };

  const sellHandler = useSellCertificateHandler(
    price,
    exchangeCertificates,
    resetAction
  );

  const actionLogic = useSellActionLogic({
    selectedIds,
    exchangeCertificates,
    allDevices,
    allFuelTypes,
  });

  const calculatedTotalPrice = parseFloat(price) * totalAmount;
  const totalPrice = isNaN(calculatedTotalPrice)
    ? '0.00'
    : calculatedTotalPrice.toFixed(2).toString();
  const buttonDisabled =
    isNaN(calculatedTotalPrice) || calculatedTotalPrice === 0;

  return {
    ...actionLogic,
    price,
    handlePriceChange,
    sellHandler,
    setTotalAmount,
    totalPrice,
    buttonDisabled,
  };
};
