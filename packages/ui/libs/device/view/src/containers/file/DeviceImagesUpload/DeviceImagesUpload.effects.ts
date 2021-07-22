import { UploadedFile } from '@energyweb/origin-ui-core';
import { fileUploadHandler } from '@energyweb/origin-ui-device-data';
import { DeviceImagesFormValues } from 'libs/device/logic/src/registerForm/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useDeviceImagesUploadEffects = () => {
  const [imageIds, setImageIds] = useState<UploadedFile[]>([]);

  const values: DeviceImagesFormValues = {
    imageIds: imageIds
      .filter((doc) => !doc.removed)
      .map((doc) => doc.uploadedName),
  };
  const { t } = useTranslation();

  const uploadText = t('file.upload.dropOrClick');
  const deviceImagesHeading = t('device.register.deviceImagesFormTitle');

  const uploadFunction = fileUploadHandler;
  const onDeviceImageChange = (newValues) => setImageIds(newValues);

  const buttonDisabled = imageIds.length < 1;
  const buttonText = t('general.buttons.submit');

  return {
    values,
    uploadText,
    uploadFunction,
    onDeviceImageChange,
    deviceImagesHeading,
    buttonDisabled,
    buttonText,
  };
};
