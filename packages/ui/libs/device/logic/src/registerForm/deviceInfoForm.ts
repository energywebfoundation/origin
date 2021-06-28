import * as yup from 'yup';
import { gridOperatorOptions } from '../utils';
import {
  prepareDeviceTypesOptions,
  prepareFuelTypesOptions,
} from './prepareOptions';
import { TCreateDeviceInfoForm } from './types';

export const createDeviceInfoForm: TCreateDeviceInfoForm = (
  t,
  allFuelTypes,
  allDeviceTypes,
  externalDeviceId
) => ({
  formTitle: t('device.register.deviceInfoFormTitle'),
  inputsVariant: 'filled',
  initialValues: {
    facilityName: '',
    fuelType: '',
    deviceType: '',
    commissioningDate: '',
    registrationDate: '',
    description: '',
    smartMeterId: '',
    capacity: '',
    gridOperator: '',
  },
  validationSchema: yup.object().shape({
    facilityName: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.facilityName'),
      })
    ),
    fuelType: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.fuelType'),
      })
    ),
    deviceType: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.deviceType'),
      })
    ),
    commissioningDate: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.commissioningDate'),
      })
    ),
    registrationDate: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.registrationDate'),
      })
    ),
    description: yup.string(),
    smartMeterId: yup.string(),
    capacity: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.capacity'),
      })
    ),
  }),
  fields: [
    {
      name: 'facilityName',
      label: t('device.register.facilityName'),
    },
    {
      name: 'fuelType',
      label: t('device.register.fuelType'),
      select: true,
      autocomplete: true,
      options: prepareFuelTypesOptions(allFuelTypes),
    },
    {
      name: 'deviceType',
      label: t('device.register.deviceType'),
      select: true,
      autocomplete: true,
      dependentOn: 'fuelType',
      dependentOptionsCallback: prepareDeviceTypesOptions(allDeviceTypes),
    },
    {
      name: 'commissioningDate',
      label: t('device.register.commissioningDate'),
      datePicker: true,
    },
    {
      name: 'registrationDate',
      label: t('device.register.registrationDate'),
      datePicker: true,
    },
    {
      name: 'description',
      label: t('device.register.description'),
      textFieldProps: {
        multiline: true,
        rows: 3,
      },
    },
    {
      name: 'smartMeterId',
      label: externalDeviceId,
    },
    {
      name: 'capacity',
      label: t('device.register.capacity'),
    },
    {
      name: 'gridOperator',
      label: t('device.register.gridOperator'),
      select: true,
      options: gridOperatorOptions,
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
