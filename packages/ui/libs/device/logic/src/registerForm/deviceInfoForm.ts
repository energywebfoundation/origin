import * as yup from 'yup';
import { GenericFormField } from '@energyweb/origin-ui-core';
import {
  prepareDeviceTypesOptions,
  prepareFuelTypesOptions,
  prepareAccountCodeOptions,
  gridOperatorOptions,
} from '../utils';
import { TCreateDeviceInfoForm, DeviceInfoFormValues } from './types';

export const createDeviceInfoForm: TCreateDeviceInfoForm = (
  t,
  allFuelTypes,
  allDeviceTypes,
  myAccounts,
  externalDeviceId,
  singleAccountMode
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
    irecTradeAccountCode: '',
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
    smartMeterId: yup.string().required().label(externalDeviceId),
    description: yup.string(),
  }),
  fields: [
    {
      name: 'facilityName',
      label: t('device.register.facilityName'),
      required: true,
      inputProps: { ['data-cy']: 'facilityName' },
    },
    {
      name: 'fuelType',
      label: t('device.register.fuelType'),
      select: true,
      autocomplete: true,
      required: true,
      options: prepareFuelTypesOptions(allFuelTypes),
      inputProps: { ['data-cy']: 'fuelType' },
    },
    {
      name: 'deviceType',
      label: t('device.register.deviceType'),
      select: true,
      autocomplete: true,
      dependentOn: 'fuelType',
      dependentOptionsCallback: prepareDeviceTypesOptions(allDeviceTypes),
      required: true,
      inputProps: { ['data-cy']: 'deviceType' },
    },
    {
      name: 'commissioningDate',
      label: t('device.register.commissioningDate'),
      datePicker: true,
      required: true,
      inputProps: { ['data-cy']: 'commissioningDate' },
    },
    {
      name: 'registrationDate',
      label: t('device.register.registrationDate'),
      datePicker: true,
      required: true,
      inputProps: { ['data-cy']: 'registrationDate' },
    },
    {
      name: 'gridOperator',
      label: t('device.register.gridOperator'),
      select: true,
      options: gridOperatorOptions,
      required: true,
      inputProps: { ['data-cy']: 'gridOperator' },
    },
    ...(singleAccountMode
      ? ([
          {
            name: 'irecTradeAccountCode',
            label: t('device.register.irecTradeAccountCode'),
            select: true,
            options: prepareAccountCodeOptions(myAccounts),
            inputProps: { ['data-cy']: 'irecTradeAccountCode' },
          },
        ] as GenericFormField<DeviceInfoFormValues>[])
      : []),
    {
      name: 'capacity',
      label: t('device.register.capacity'),
      required: true,
      inputProps: { ['data-cy']: 'capacity' },
    },
    {
      name: 'smartMeterId',
      label: externalDeviceId,
      required: true,
      inputProps: { ['data-cy']: 'smartMeterId' },
    },
    {
      name: 'description',
      label: t('device.register.description'),
      textFieldProps: {
        multiline: true,
        rows: 3,
      },
      inputProps: { ['data-cy']: 'description' },
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
