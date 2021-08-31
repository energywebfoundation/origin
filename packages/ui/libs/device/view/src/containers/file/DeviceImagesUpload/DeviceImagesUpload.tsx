import {
  FileUpload,
  GenericFormSecondaryButton,
} from '@energyweb/origin-ui-core';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { DeviceImagesFormValues } from '@energyweb/origin-ui-device-logic';
import React, { FC } from 'react';
import { useDeviceImagesUploadEffects } from './DeviceImagesUpload.effects';
import { UnpackNestedValue } from 'react-hook-form';

export interface DeviceImagesUploadProps {
  submitHandler: (
    values: UnpackNestedValue<DeviceImagesFormValues>
  ) => Promise<void>;
  secondaryButtons?: GenericFormSecondaryButton[];
  loading?: boolean;
}

export const DeviceImagesUpload: FC<DeviceImagesUploadProps> = ({
  submitHandler,
  secondaryButtons,
  loading,
}) => {
  const {
    values,
    uploadText,
    uploadFunction,
    onDeviceImageChange,
    deviceImagesHeading,
    buttonText,
  } = useDeviceImagesUploadEffects();

  return (
    <Box>
      <FileUpload
        dropzoneText={uploadText}
        heading={deviceImagesHeading}
        apiUploadFunction={uploadFunction}
        onChange={onDeviceImageChange}
      />
      <Box mt={1} display="flex" justifyContent="flex-end">
        {secondaryButtons &&
          secondaryButtons.map((button) => (
            <Button key={`secondary-button-${button.label}`} {...button}>
              {button.label}
            </Button>
          ))}
        <Button
          color="primary"
          name="submit"
          size="large"
          variant="contained"
          disabled={loading}
          onClick={() => submitHandler(values)}
        >
          {buttonText}
          {loading && (
            <Box ml={2}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Button>
      </Box>
    </Box>
  );
};
