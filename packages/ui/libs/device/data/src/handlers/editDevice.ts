import { getDeviceRegistryControllerGetMyDevicesQueryKey } from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceState,
  getDeviceControllerGetMyDevicesQueryKey,
  UpdateDeviceDTO,
  useDeviceControllerUpdateDevice,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { ComposedPublicDevice } from '../types';

export type EditDeviceFormValues = {
  name: string;
  fuelType: FormSelectOption[];
  deviceType: FormSelectOption[];
  capacity: string;
  commissioningDate: string;
  registrationDate: string;
  latitude: string;
  longitude: string;
  notes: string;
};

export const useEditDeviceHandler = (
  device: ComposedPublicDevice,
  closeModal: () => void
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const myIRecDevicesQueryKey = getDeviceControllerGetMyDevicesQueryKey();
  const myOriginDevicesQueryKey =
    getDeviceRegistryControllerGetMyDevicesQueryKey();

  const { mutate, isLoading } = useDeviceControllerUpdateDevice();

  const submitHandler = (values: EditDeviceFormValues) => {
    const formattedValues: UpdateDeviceDTO = {
      ...values,
      fuelType: values.fuelType[0].value as string,
      deviceType: values.deviceType[0].value as string,
      capacity: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        parseFloat(values.capacity)
      ),
      commissioningDate: values.commissioningDate,
      registrationDate: values.registrationDate,
      countryCode: device.countryCode,
      address: device.address,
      active: device.status === DeviceState.Approved,
    };

    mutate(
      { id: device.externalRegistryId, data: formattedValues },
      {
        onSuccess: () => {
          closeModal();
          showNotification(
            t('device.edit.notifications.editSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries([
            ...myIRecDevicesQueryKey,
            ...myOriginDevicesQueryKey,
          ]);
          navigate('/device/my');
        },
        onError: (error: any) => {
          closeModal();
          showNotification(
            `${t('device.edit.notifications.editError')}:
            ${error?.response?.data?.message || ''}`,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { submitHandler, isLoading };
};
