import * as yup from 'yup';
import {
  prepareDeviceTypesOptions,
  prepareFuelTypesOptions,
  gridOperatorOptions,
} from '../utils';
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
    fuelType: [],
    deviceType: [],
    commissioningDate: '',
    registrationDate: '',
    description: '',
    smartMeterId: '',
    capacity: '',
    gridOperator: '',
  },
  validationSchema: yup.object().shape({
    facilityName: yup
      .string()
      .required()
      .label(t('device.register.facilityName')),
    fuelType: yup.array().required().label(t('device.register.fuelType')),
    deviceType: yup.array().required().label(t('device.register.deviceType')),
    commissioningDate: yup
      .string()
      .required()
      .label(t('device.register.commissioningDate')),
    registrationDate: yup
      .string()
      .required()
      .label(t('device.register.registrationDate')),
    capacity: yup.string().required().label(t('device.register.capacity')),
    description: yup.string(),
    smartMeterId: yup.string(),
  }),
  fields: [
    {
      name: 'facilityName',
      label: t('device.register.facilityName'),
      required: true,
    },
    {
      name: 'fuelType',
      label: t('device.register.fuelType'),
      select: true,
      autocomplete: true,
      required: true,
      options: prepareFuelTypesOptions(allFuelTypes),
    },
    {
      name: 'deviceType',
      label: t('device.register.deviceType'),
      select: true,
      autocomplete: true,
      dependentOn: 'fuelType',
      dependentOptionsCallback: prepareDeviceTypesOptions(allDeviceTypes),
      required: true,
    },
    {
      name: 'commissioningDate',
      label: t('device.register.commissioningDate'),
      datePicker: true,
      required: true,
    },
    {
      name: 'registrationDate',
      label: t('device.register.registrationDate'),
      datePicker: true,
      required: true,
    },
    {
      name: 'gridOperator',
      label: t('device.register.gridOperator'),
      select: true,
      options: gridOperatorOptions,
      required: true,
    },
    {
      name: 'capacity',
      label: t('device.register.capacity'),
      required: true,
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
  ],
  buttonText: t('general.buttons.nextStep'),
});
