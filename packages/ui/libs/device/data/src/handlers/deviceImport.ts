import {
  getDeviceRegistryControllerGetMyDevicesQueryKey,
  NewDeviceDTO,
  useDeviceRegistryControllerCreateDevice,
} from '@energyweb/origin-device-registry-api-react-query-client';
import {
  getDeviceControllerGetDevicesToImportFromIrecQueryKey,
  getDeviceControllerGetMyDevicesQueryKey,
  ImportIrecDeviceDTO,
  IrecDeviceDTO,
  useDeviceControllerGetDevicesToImportFromIrec,
  useDeviceControllerImportIrecDevice,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
  UploadedFile,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { UseFormReset } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiDevicesToImport = () => {
  const { data: devicesToImport, isLoading } =
    useDeviceControllerGetDevicesToImportFromIrec();

  return { devicesToImport, isLoading };
};

type TImportDeviceFormValues = {
  smartMeterId: string;
  timezone: string;
  gridOperator: string;
  postalCode: string;
  region: string;
  subregion: string;
  description: string;
};

export const useApiDeviceImportHandler = (
  device: IrecDeviceDTO,
  imageIds: UploadedFile[],
  handleModalClose: () => void
) => {
  const { t } = useTranslation();
  const { mutateAsync } = useDeviceControllerImportIrecDevice();
  const { mutate } = useDeviceRegistryControllerCreateDevice();

  const queryClient = useQueryClient();
  const devicesToImportQueryKey =
    getDeviceControllerGetDevicesToImportFromIrecQueryKey();
  const myIRecDevicesQueryKey = getDeviceControllerGetMyDevicesQueryKey();
  const myOriginDevicesQueryKey =
    getDeviceRegistryControllerGetMyDevicesQueryKey();

  return (
    values: TImportDeviceFormValues,
    reset: UseFormReset<TImportDeviceFormValues>
  ) => {
    const importData: ImportIrecDeviceDTO = {
      code: device.code,
      timezone: values.timezone,
      gridOperator: values.gridOperator,
      postalCode: values.postalCode,
      region: values.region,
      subregion: values.subregion,
    };

    mutateAsync({ data: importData })
      .then((createdIRecDevice) => {
        const originDeviceData: NewDeviceDTO = {
          externalRegistryId: createdIRecDevice.id,
          smartMeterId: values.smartMeterId,
          description: values.description,
          externalDeviceIds: [],
          imageIds: imageIds
            .filter((img) => !img.removed)
            .map((img) => img.uploadedName),
        };
        mutate(
          { data: originDeviceData },
          {
            onSuccess: () => {
              showNotification(
                t('device.import.notifications.importSuccess'),
                NotificationTypeEnum.Success
              );
              queryClient.invalidateQueries(devicesToImportQueryKey);
              queryClient.invalidateQueries(myIRecDevicesQueryKey);
              queryClient.invalidateQueries(myOriginDevicesQueryKey);
              reset();
              handleModalClose();
            },
            onError: (error: any) => {
              showNotification(
                `${t('device.import.notifications.importError')}:
                ${error?.response?.data?.message || ''}
                `,
                NotificationTypeEnum.Error
              );
            },
          }
        );
      })
      .catch((error: AxiosError) => {
        showNotification(
          `${t('device.import.notifications.importError')}:
          ${error?.response?.data?.message || ''}
          `,
          NotificationTypeEnum.Error
        );
      });
  };
};
