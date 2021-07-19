import {
  useCachedExchangeCertificates,
  useCachedAllFuelTypes,
  useCachedAllDevices,
  useCreateBundleHandler,
} from '@energyweb/origin-ui-exchange-data';
import { useSellAsBundleActionLogic } from '@energyweb/origin-ui-exchange-logic';
import { ChangeEvent, useState } from 'react';

export const useSellActionEffects = <Id>(
  selectedIds: Id[],
  resetIds: () => void
) => {
  const [totalAmount, setTotalAmount] = useState<number>();
  const [price, setPrice] = useState('');

  const handlePriceChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPrice(event.target.value);
  };

  const exchangeCertificates = useCachedExchangeCertificates();
  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  const resetForm = () => {
    setPrice('');
    resetIds();
  };

  const sellBundleHandler = useCreateBundleHandler(price, resetForm);

  const actionLogic = useSellAsBundleActionLogic({
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
    sellBundleHandler,
    setTotalAmount,
    totalPrice,
    buttonDisabled,
  };
};
