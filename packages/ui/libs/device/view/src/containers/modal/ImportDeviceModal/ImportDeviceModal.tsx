import { FileUpload, GenericForm } from '@energyweb/origin-ui-core';
import { Box, CircularProgress, Dialog, DialogContent } from '@mui/material';
import React from 'react';
import { useImportDeviceModalEffects } from './ImportDeviceModal.effects';
import { useStyles } from './ImportDeviceModal.styles';

export const ImportDeviceModal = () => {
  const { formProps, fileUploadProps, isOpen, handleModalClose, isLoading } =
    useImportDeviceModalEffects();
  const classes = useStyles();

  if (isLoading) return <CircularProgress />;

  return (
    <Dialog open={isOpen} onClose={handleModalClose} maxWidth="sm">
      <DialogContent>
        <Box width="100%">
          <GenericForm {...formProps}>
            <FileUpload
              {...fileUploadProps}
              headingProps={{ className: classes.fileHeading }}
              dropzoneClassName={classes.dropzone}
            />
          </GenericForm>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
