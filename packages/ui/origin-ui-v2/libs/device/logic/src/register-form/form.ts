import { TRegisterDeviceForm } from '../types';
import * as yup from 'yup';
import { deviceTypes } from './deviceTypesMock';
import { convert2DArrayToLevels } from '@energyweb/origin-ui-utils';

export const createRegisterDeviceForm: TRegisterDeviceForm = (
  t,
  externalDeviceId
) => ({
  formTitle: t('device.register.formTitle'),
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    facilityName: '',
    deviceType: '',
    commissioningDate: null,
    registrationDate: null,
    projectStory: '',
    externalDeviceIdType: '',
    capacity: '',
    region: '',
    province: '',
    gridOperator: '',
    address: '',
    latitude: '',
    longitude: '',
  },
  validationSchema: yup.object().shape({
    facilityName: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.facilityName'),
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
    projectStory: yup.string(),
    externalDeviceIdType: yup.string(),
    capacity: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.capacity') })
      ),
    region: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.region') })
      ),
    province: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.province') })
      ),
    gridOperator: yup.string().required(
      t('validation.requiredField', {
        field: t('device.register.gridOperator'),
      })
    ),
    address: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.address') })
      ),
    latitude: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.latitude') })
      ),
    longitude: yup
      .string()
      .required(
        t('validation.requiredField', { field: t('device.register.longitude') })
      ),
  }),
  fields: [
    {
      name: 'facilityName',
      label: t('device.register.facilityName'),
    },
    {
      name: 'deviceType',
      label: t('device.register.deviceType'),
      hierarchical: true,
      hierarchicalOptions: convert2DArrayToLevels(deviceTypes, 3),
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
      name: 'projectStory',
      label: t('device.register.projectStory'),
      textFieldProps: {
        multiline: true,
        rows: 5,
      },
    },
    {
      name: 'externalDeviceIdType',
      label: externalDeviceId,
    },
    {
      name: 'capacity',
      label: t('device.register.capacity'),
    },
    {
      name: 'region',
      label: t('device.register.region'),
    },
    {
      name: 'province',
      label: t('device.register.province'),
    },
    {
      name: 'gridOperator',
      label: t('device.register.gridOperator'),
    },
    {
      name: 'address',
      label: t('device.register.address'),
    },
    {
      name: 'latitude',
      label: t('device.register.latitude'),
    },
    {
      name: 'longitude',
      label: t('device.register.longitude'),
    },
  ],
  buttonText: t('form.register'),
});
