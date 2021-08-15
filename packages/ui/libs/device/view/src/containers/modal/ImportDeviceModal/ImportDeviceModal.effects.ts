import { useImportDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  fileUploadHandler,
  useApiDeviceImportHandler,
} from '@energyweb/origin-ui-device-data';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { UploadedFile } from '@energyweb/origin-ui-core';
import {
  DeviceModalsActionsEnum,
  useDeviceModalsDispatch,
  useDeviceModalsStore,
} from '../../../context';

export const useImportDeviceModalEffects = () => {
  const { t } = useTranslation();
  const deviceImagesHeading = t('device.import.deviceImages');
  const uploadText = t('file.upload.dropOrClick');

  const { importDevice } = useDeviceModalsStore();
  const [imageIds, setImageIds] = useState<UploadedFile[]>([]);
  const onDeviceImageChange = (newValues: UploadedFile[]) =>
    setImageIds(newValues);

  const dispatchModals = useDeviceModalsDispatch();
  const isOpen = importDevice?.open;
  const handleModalClose = () => {
    dispatchModals({
      type: DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE,
      payload: {
        open: false,
        deviceToImport: null,
      },
    });
  };

  const formLogic = useImportDeviceFormLogic(handleModalClose);
  const submitHandler = useApiDeviceImportHandler(
    importDevice?.deviceToImport,
    imageIds,
    handleModalClose
  );
  const formProps = {
    ...formLogic,
    submitHandler,
  };

  const fileUploadProps = {
    dropzoneText: uploadText,
    heading: deviceImagesHeading,
    apiUploadFunction: fileUploadHandler,
    onChange: onDeviceImageChange,
  };

  return { formProps, fileUploadProps, isOpen, handleModalClose };
};
