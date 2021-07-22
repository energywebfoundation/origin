import { GenericForm } from '@energyweb/origin-ui-core';
import { Dialog, DialogContent } from '@material-ui/core';
import React from 'react';
import { useUpdateSupplyModalEffects } from './UpdateSupplyModal.effects';

export const UpdateSupplyModal = () => {
  const { formProps, isOpen, handleModalClose } = useUpdateSupplyModalEffects();

  return (
    <Dialog open={isOpen} onClose={handleModalClose} maxWidth="sm">
      <DialogContent>
        <GenericForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
};
