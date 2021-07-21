import React, { FC } from 'react';
import { UpdateSupplyModal } from './UpdateSupplyModal';
import { RemoveSupplyConfirmModal } from './RemoveSupplyConfirmModal';

export const ExchangeModalsCenter: FC = () => {
  return (
    <>
      <UpdateSupplyModal />
      <RemoveSupplyConfirmModal />
    </>
  );
};
