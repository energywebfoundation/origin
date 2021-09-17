import { FileUploadProps, UploadedFile } from '@energyweb/origin-ui-core';
import {
  ComposedDevice,
  fileUploadHandler,
  useRequestCertificatesHandler,
} from '@energyweb/origin-ui-device-data';
import { useRequestCertificatesLogic } from '@energyweb/origin-ui-device-logic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useRequestCertificateFormEffects = (
  device: ComposedDevice,
  closeForm: () => void
) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const formLogic = useRequestCertificatesLogic();
  const {
    requestHandler,
    isLoading,
    isMutating,
  } = useRequestCertificatesHandler({
    files,
    deviceId: device.externalRegistryId,
    closeForm,
  });
  const formProps = {
    ...formLogic,
    submitHandler: requestHandler,
  };

  const uploadText = t('file.upload.dropOrClick');
  const onDeviceFilesChange = (newValues: UploadedFile[]) =>
    setFiles(newValues);
  const fileUploadProps: FileUploadProps = {
    dropzoneText: uploadText,
    apiUploadFunction: fileUploadHandler,
    onChange: onDeviceFilesChange,
  };

  const formTitle = t('device.my.requestCertificates.formTitle');

  return { formProps, fileUploadProps, isMutating, isLoading, formTitle };
};
