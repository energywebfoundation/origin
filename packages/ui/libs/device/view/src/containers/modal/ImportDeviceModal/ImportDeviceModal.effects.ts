import { useImportDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  fileUploadHandler,
  useApiDeviceImportHandler,
  useApiRegionsConfiguration,
} from '@energyweb/origin-ui-device-data';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { UploadedFile } from '@energyweb/origin-ui-core';
import {
  DeviceModalsActionsEnum,
  useDeviceAppEnv,
  useDeviceModalsDispatch,
  useDeviceModalsStore,
} from '../../../context';
import { Countries } from '@energyweb/utils-general';

export const useImportDeviceModalEffects = () => {
  const { t } = useTranslation();
  const { smartMeterId } = useDeviceAppEnv();

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

  const { allRegions, country, isLoading } = useApiRegionsConfiguration();
  const platformCountryCode = Countries.find(
    (cntr) => cntr.name === country
  )?.code;

  const formLogic = useImportDeviceFormLogic(
    handleModalClose,
    smartMeterId,
    allRegions,
    platformCountryCode
  );
  const submitHandler = useApiDeviceImportHandler(
    importDevice?.deviceToImport,
    imageIds,
    handleModalClose,
    platformCountryCode
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

  return { formProps, fileUploadProps, isOpen, handleModalClose, isLoading };
};
