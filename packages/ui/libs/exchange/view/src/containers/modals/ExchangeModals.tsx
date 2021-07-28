import React, { FC } from 'react';
import { UpdateSupplyModal } from './UpdateSupplyModal';
import { RemoveSupplyConfirmModal } from './RemoveSupplyConfirmModal';
import { BundleDetails } from './BundleDetails';
import { DirectBuy } from './DirectBuy';
import { RemoveOrderConfirm } from './RemoveOrderConfirm';

export const ExchangeModals: FC = () => {
  return (
    <>
      <BundleDetails />
      <UpdateSupplyModal />
      <RemoveSupplyConfirmModal />
      <DirectBuy />
      <RemoveOrderConfirm />
    </>
  );
};
