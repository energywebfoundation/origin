import { GenericForm } from '@energyweb/origin-ui-core';
import { Box, Dialog, DialogContent } from '@material-ui/core';
import React from 'react';
import { useDirectBuyEffects } from './DirectBuy.effects';

export const DirectBuy = () => {
  const { formProps, open, handleModalClose } = useDirectBuyEffects();

  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm">
      <DialogContent>
        <Box minWidth="300px">
          <GenericForm {...formProps} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
