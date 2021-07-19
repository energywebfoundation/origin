import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BundleActionContentProps } from './BundleActionContent';

export type EnergyAmounts<Id> = {
  id: Id;
  amount: string;
};

export const useBundleActionContentEffects = <Id>(
  selectedIds: Id[],
  selectedItems: BundleActionContentProps<Id>['selectedItems'],
  submitHandler: BundleActionContentProps<Id>['submitHandler'],
  setTotalAmount?: BundleActionContentProps<Id>['setTotalAmount']
) => {
  const { t } = useTranslation();
  const [energyAmounts, setEnergyAmounts] = useState<EnergyAmounts<Id>[]>([]);

  const addOrRemoveEnergyOnCheck = (
    ids: Id[],
    items: BundleActionContentProps<Id>['selectedItems']
  ) => {
    if (ids.length === 0) {
      setEnergyAmounts([]);
      return;
    }
    if (ids.length > energyAmounts.length) {
      ids.forEach((id) => {
        const alreadyIncluded = energyAmounts.find(
          (amount) => amount.id === id
        );

        if (!alreadyIncluded) {
          const preparedNewItem: EnergyAmounts<Id> = {
            id,
            amount: parseInt(
              items.find((item) => item.id === id).energy.replace(/,/g, '')
            ).toString(),
          };
          setEnergyAmounts([...energyAmounts, preparedNewItem]);
        }
      });
    }
    if (ids.length < energyAmounts.length) {
      energyAmounts.forEach((amount) => {
        const itemStillExists = ids.includes(amount.id);
        if (!itemStillExists) {
          const filteredAmounts = energyAmounts.filter(
            (stateAmount) => stateAmount.id !== amount.id
          );
          setEnergyAmounts(filteredAmounts);
        }
      });
    }
  };

  useEffect(() => {
    addOrRemoveEnergyOnCheck(selectedIds, selectedItems);
  }, [selectedIds]);

  const handleItemEnergyAmountChange = (id: Id, amount: string) => {
    const newAmounts = energyAmounts.map((stateAmount) => {
      if (stateAmount.id === id) {
        return {
          id,
          amount,
        };
      }
      return stateAmount;
    });
    setEnergyAmounts(newAmounts);
  };

  const handleSubmit = async () => {
    await submitHandler(energyAmounts);
  };

  const getEnergyAmountForItem = (id: Id) => {
    return energyAmounts.find((stateAmount) => stateAmount.id === id)?.amount;
  };

  const selectCertificateText = t('exchange.createBundle.selectCertificate');
  const totalVolumeText = t('exchange.createBundle.totalVolume');

  const totalVolume = energyAmounts.reduce(
    (total, current) => (total += parseInt(current.amount)),
    0
  );

  useEffect(() => {
    if (setTotalAmount) {
      setTotalAmount(totalVolume);
    }
  }, [totalVolume]);

  return {
    selectCertificateText,
    totalVolumeText,
    totalVolume,
    getEnergyAmountForItem,
    handleItemEnergyAmountChange,
    handleSubmit,
  };
};
