import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TCreateDeviceLocationForm } from './types';

export const createDeviceLocationForm: TCreateDeviceLocationForm = (t) => ({
  formTitle: t('device.register.deviceLocationFormTitle'),
  inputsVariant: 'filled',
  initialValues: {
    countryCode: '',
    region: '',
    subregion: '',
    postalCode: '',
    address: '',
    latitude: '',
    longitude: '',
  },
  validationSchema: yup.object().shape({
    countryCode: yup.string().required().label(t('device.register.country')),
    region: yup.string().required().label(t('device.register.region')),
    subregion: yup.string().required().label(t('device.register.subregion')),
    postalCode: yup.string().required().label(t('device.register.postalCode')),
    address: yup.string().required().label(t('device.register.address')),
    latitude: yup.string().required().label(t('device.register.latitude')),
    longitude: yup.string().required().label(t('device.register.longitude')),
  }),
  fields: [
    {
      name: 'countryCode',
      label: t('device.register.country'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'region',
      label: t('device.register.region'),
    },
    {
      name: 'subregion',
      label: t('device.register.subregion'),
    },
    {
      name: 'postalCode',
      label: t('device.register.postalCode'),
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
  buttonText: t('general.buttons.nextStep'),
});
