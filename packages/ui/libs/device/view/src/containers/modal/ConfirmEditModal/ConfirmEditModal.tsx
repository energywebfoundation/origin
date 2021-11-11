import React from 'react';
import { GenericModal, SpecField } from '@energyweb/origin-ui-core';
import { useConfirmEditModalEffects } from './ConfirmEditModal.effects';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ConfirmEditModal = () => {
  const { t } = useTranslation();
  const { open, modalConfig, notes } = useConfirmEditModalEffects();
  return (
    <GenericModal
      dialogProps={{ maxWidth: 'sm' }}
      titleProps={{ textAlign: 'center' }}
      open={open}
      customContent={
        <>
          <Typography component="span" variant="h5">
            {modalConfig.title}
          </Typography>
          <Divider sx={{ width: '100%', my: '10px' }} />
          <Box>
            {modalConfig.specFields
              ? modalConfig.specFields.map((field) => (
                  <SpecField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))
              : null}
          </Box>
          <Divider sx={{ width: '100%', my: '10px' }} />
          <Typography component={'span'} variant="h6" color="textSecondary">
            {t('device.edit.notes')}:
          </Typography>
          <Typography>{notes ?? ''}</Typography>
        </>
      }
      buttons={modalConfig.buttons}
    />
  );
};
