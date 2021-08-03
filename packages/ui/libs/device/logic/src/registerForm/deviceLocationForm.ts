import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TCreateDeviceLocationForm } from './types';
import { prepareRegionsOption, prepareSubregionOptions } from '../utils';

export const createDeviceLocationForm: TCreateDeviceLocationForm = (
  t,
  allRegions
) => ({
  formTitle: t('device.register.deviceLocationFormTitle'),
  inputsVariant: 'filled',
  initialValues: {
    countryCode: [],
    region: [],
    subregion: [],
    postalCode: '',
    address: '',
    latitude: '',
    longitude: '',
  },
  validationSchema: yup.object().shape({
    countryCode: yup.array().required().label(t('device.register.country')),
    region: yup.array().required().label(t('device.register.region')),
    subregion: yup.array().required().label(t('device.register.subregion')),
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
      required: true,
    },
    {
      name: 'region',
      label: t('device.register.region'),
      required: true,
      select: true,
      autocomplete: true,
      options: prepareRegionsOption(allRegions),
    },
    {
      name: 'subregion',
      label: t('device.register.subregion'),
      select: true,
      required: true,
      autocomplete: true,
      dependentOn: 'region',
      dependentOptionsCallback: prepareSubregionOptions(allRegions),
    },
    {
      name: 'postalCode',
      label: t('device.register.postalCode'),
      required: true,
    },
    {
      name: 'address',
      label: t('device.register.address'),
      required: true,
    },
    {
      name: 'latitude',
      label: t('device.register.latitude'),
      required: true,
    },
    {
      name: 'longitude',
      label: t('device.register.longitude'),
      required: true,
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
