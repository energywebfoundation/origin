import React, { FC } from 'react';
import { Typography } from '@material-ui/core';

import { FileUpload, GenericForm } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';

import { useStyles } from './RequestCertificateForm.styles';
import { useRequestCertificateFormEffects } from './RequestCertificateForm.effects';

export interface RequestCertificateFormProps {
  device: ComposedDevice;
  closeForm: () => void;
}

export const RequestCertificateForm: FC<RequestCertificateFormProps> = ({
  device,
  closeForm,
}) => {
  const classes = useStyles();
  const { formProps, fileUploadProps, isLoading, formTitle } =
    useRequestCertificateFormEffects(device, closeForm);

  if (isLoading) {
    return <></>;
  }

  return (
    <div className={classes.formWrapper}>
      <Typography variant="h5">{formTitle}</Typography>
      <Typography color="textSecondary">{device.name}</Typography>
      <GenericForm {...formProps}>
        <FileUpload dropzoneClassName={classes.dropzone} {...fileUploadProps} />
      </GenericForm>
    </div>
  );
};
