import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  ComposedPublicDevice,
  EditDeviceFormValues,
} from '@energyweb/origin-ui-device-data';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { prepareDeviceTypesOptions, prepareFuelTypesOptions } from '../utils';

export const useEditDeviceFormLogic = (
  device: ComposedPublicDevice,
  allFuelTypes: CodeNameDTO[],
  allDeviceTypes: CodeNameDTO[],
  loading?: boolean
): Omit<GenericFormProps<EditDeviceFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();

  const allFuelTypesOptions = useMemo(() => {
    return prepareFuelTypesOptions(allFuelTypes);
  }, [allFuelTypes]);

  const getDeviceType = useMemo(() => {
    return prepareDeviceTypesOptions(allDeviceTypes);
  }, [allDeviceTypes]);

  const currentFuelTypeOption = allFuelTypesOptions?.find(
    (option) => option.value === device.fuelType
  );
  const currentDeviceTypeOption = useMemo(() => {
    const availableDeviceTypeOptions = getDeviceType([currentFuelTypeOption]);
    return availableDeviceTypeOptions?.find(
      (option) => option.value === device.deviceType
    );
  }, [currentFuelTypeOption]);

  return {
    formTitle: t('device.edit.formTitle', { deviceName: device.name }),
    initialValues: {
      name: device.name,
      fuelType: currentFuelTypeOption ? [currentFuelTypeOption] : [],
      deviceType: currentDeviceTypeOption ? [currentDeviceTypeOption] : [],
      capacity: PowerFormatter.format(device.capacity).replace(/,/g, ''),
      commissioningDate: device.commissioningDate,
      registrationDate: device.registrationDate,
      latitude: device.latitude,
      longitude: device.longitude,
      notes: device.notes,
    },
    validationSchema: yup.object().shape({
      name: yup.string().required().label(t('device.edit.name')),
      fuelType: yup.array().required().label(t('device.edit.fuelType')),
      deviceType: yup.array().required().label(t('device.edit.deviceType')),
      commissioningDate: yup
        .string()
        .required()
        .label(t('device.edit.commissioningDate')),
      registrationDate: yup
        .string()
        .required()
        .label(t('device.edit.registrationDate')),
      capacity: yup.string().required().label(t('device.edit.capacity')),
      latitude: yup.string().required().label(t('device.edit.latitude')),
      longitude: yup.string().required().label(t('device.edit.longitude')),
    }),
    fields: [
      {
        name: 'name',
        label: t('device.edit.name'),
        inputProps: { ['data-cy']: 'facilityName' },
      },
      {
        name: 'fuelType',
        label: t('device.edit.fuelType'),
        select: true,
        autocomplete: true,
        required: true,
        options: allFuelTypesOptions,
      },
      {
        name: 'deviceType',
        label: t('device.edit.deviceType'),
        select: true,
        autocomplete: true,
        dependentOn: 'fuelType',
        dependentOptionsCallback: getDeviceType,
        required: true,
      },
      {
        name: 'commissioningDate',
        label: t('device.edit.commissioningDate'),
        datePicker: true,
        required: true,
      },
      {
        name: 'registrationDate',
        label: t('device.edit.registrationDate'),
        datePicker: true,
        required: true,
      },
      {
        name: 'capacity',
        label: t('device.edit.capacity'),
        required: true,
      },
      {
        name: 'latitude',
        label: t('device.edit.latitude'),
        required: true,
      },
      {
        name: 'longitude',
        label: t('device.edit.longitude'),
        required: true,
      },
      {
        name: 'notes',
        label: t('device.edit.notes'),
        textFieldProps: {
          multiline: true,
          rows: 5,
        },
      },
    ],
    twoColumns: true,
    inputsVariant: 'filled',
    buttonText: t('general.buttons.edit'),
    buttonProps: { ['data-cy']: 'editDeviceButton' },
    loading,
  };
};
