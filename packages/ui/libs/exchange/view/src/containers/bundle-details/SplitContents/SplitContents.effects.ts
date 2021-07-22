import { usePaginateData } from '@energyweb/origin-ui-core';
import {
  BundleSplit,
  useBuyBundleHandler,
  useCachedAllDevices,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsDispatch,
} from '../../../context';

const PAGE_SIZE = 5;

export const useSplitContentsEffects = (splits: BundleSplit[]) => {
  const { paginatedData, setActivePage, activePage } = usePaginateData(
    splits,
    PAGE_SIZE
  );
  const isFirstPage = activePage === 0;
  const totalPages = Math.ceil(splits.length / PAGE_SIZE);
  const isLastPage = activePage === totalPages - 1;
  const [selectedVolume, setSelectedVolume] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const handleSelect = (volume: BundleSplit['volume']) => {
    if (volume.toNumber() === selectedVolume.toNumber()) {
      return setSelectedVolume(BigNumber.from(0));
    }
    setSelectedVolume(volume);
  };

  const handleNextPage = () => {
    if (isLastPage) {
      return;
    }
    setActivePage(activePage + 1);
  };

  const handlePreviousPage = () => {
    if (isFirstPage) {
      return;
    }
    setActivePage(activePage - 1);
  };

  const dispatchModals = useExchangeModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_BUNDLE_DETAILS,
      payload: {
        open: false,
        bundle: null,
        isOwner: false,
      },
    });
  };

  const buyHandler = useBuyBundleHandler(selectedVolume, closeModal);

  const allDevices = useCachedAllDevices();
  const allFuelTypes = useCachedAllFuelTypes();

  return {
    paginatedData,
    allDevices,
    allFuelTypes,
    isFirstPage,
    isLastPage,
    selectedVolume,
    handleNextPage,
    handlePreviousPage,
    handleSelect,
    buyHandler,
  };
};
