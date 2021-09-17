import { FileUpload, GenericForm } from '@energyweb/origin-ui-core';
import { Dialog, DialogContent } from '@material-ui/core';
import React from 'react';
import { useImportDeviceModalEffects } from './ImportDeviceModal.effects';
import { useStyles } from './ImportDeviceModal.styles';

export const ImportDeviceModal = () => {
  const {
    formProps,
    fileUploadProps,
    isOpen,
    handleModalClose,
  } = useImportDeviceModalEffects();
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleModalClose} maxWidth="sm">
      <DialogContent>
        <GenericForm {...formProps}>
          <FileUpload
            {...fileUploadProps}
            headingProps={{ className: classes.fileHeading }}
            dropzoneClassName={classes.dropzone}
          />
        </GenericForm>
      </DialogContent>
    </Dialog>
  );
};
