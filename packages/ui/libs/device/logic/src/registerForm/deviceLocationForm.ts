import * as yup from 'yup';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  getCountriesTimeZones,
  getTimeZonesOptions,
  prepareRegionsOption,
  prepareSubregionOptions,
} from '../utils';
import { TCreateDeviceLocationForm, DeviceLocationFormValues } from './types';

export const createDeviceLocationForm: TCreateDeviceLocationForm = (
  t,
  allRegions,
  platformCountryCode
) => {
  const { countryTimezones, moreThanOneTimeZone } =
    getCountriesTimeZones(platformCountryCode);

  const formConfig: Omit<
    GenericFormProps<DeviceLocationFormValues>,
    'submitHandler'
  > = {
    formTitle: t('device.register.deviceLocationFormTitle'),
    inputsVariant: 'filled',
    initialValues: {
      timeZone: [],
      region: [],
      subregion: [],
      postalCode: '',
      address: '',
      latitude: '',
      longitude: '',
    },
    validationSchema: yup.object().shape({
      timeZone: moreThanOneTimeZone
        ? yup.array().required().label(t('device.register.timezone'))
        : yup.array().label(t('device.register.timezone')),
      region: yup.array().required().label(t('device.register.region')),
      subregion: yup.array().required().label(t('device.register.subregion')),
      postalCode: yup
        .string()
        .required()
        .label(t('device.register.postalCode')),
      address: yup.string().required().label(t('device.register.address')),
      latitude: yup.string().required().label(t('device.register.latitude')),
      longitude: yup.string().required().label(t('device.register.longitude')),
    }),
    fields: [
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
  };

  if (moreThanOneTimeZone) {
    formConfig.fields.unshift({
      name: 'timeZone',
      label: t('device.register.timeZone'),
      required: true,
      select: true,
      autocomplete: true,
      options: getTimeZonesOptions(countryTimezones),
    });
  }

  return formConfig;
};
