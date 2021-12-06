import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { GenericModalProps, SpecFieldProps } from '@energyweb/origin-ui-core';
import { EditDeviceFormValues } from '@energyweb/origin-ui-device-data';
import { formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';

export interface UseEditDeviceConfirmModalLogicArgs {
  editData: EditDeviceFormValues;
  submitHandler: (values: EditDeviceFormValues) => void;
  cancelHandler: () => void;
  allFuelTypes: CodeNameDTO[];
  allDeviceTypes: CodeNameDTO[];
}

export const useEditDeviceConfirmModalLogic = ({
  editData,
  submitHandler,
  cancelHandler,
  allFuelTypes,
  allDeviceTypes,
}: UseEditDeviceConfirmModalLogicArgs): Omit<GenericModalProps, 'open'> & {
  specFields?: SpecFieldProps[];
} => {
  const { t } = useTranslation();

  if (!editData || !allFuelTypes || !allDeviceTypes) return {};

  const fuelType = allFuelTypes.find(
    (type) => type.code === editData.fuelType[0].value
  )?.name;
  const deviceType = allDeviceTypes.find(
    (type) => type.code === editData.deviceType[0].value
  )?.name;

  const editedData: Record<string, string> = {
    name: editData.name,
    fuelType,
    deviceType,
    capacity: editData.capacity,
    commissioningDate: formatDate(editData.commissioningDate),
    registrationDate: formatDate(editData.registrationDate),
    latitude: editData.latitude,
    longitude: editData.longitude,
  };

  return {
    title: t('device.modals.editConfirm.title'),
    buttons: [
      { label: t('general.buttons.cancel'), onClick: cancelHandler },
      {
        label: t('general.buttons.confirm'),
        onClick: () => submitHandler(editData),
      },
    ],
    specFields: Object.keys(editedData).map((key) => ({
      label: t(`device.edit.${key}`),
      value: editedData[key],
    })),
  };
};
