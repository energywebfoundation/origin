import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  getCountriesTimeZones,
  getTimeZonesOptions,
  gridOperatorOptions,
  prepareRegionsOption,
  prepareSubregionOptions,
} from '../utils';
import {
  TUseImportDeviceFormLogic,
  TUseImportDeviceFormLogicReturnType,
} from './types';

export const useImportDeviceFormLogic: TUseImportDeviceFormLogic = (
  handleClose,
  smartMeterId,
  allRegions,
  platformCountryCode
) => {
  const { t } = useTranslation();
  const { countryTimezones, moreThanOneTimeZone } =
    getCountriesTimeZones(platformCountryCode);

  const formConfig: TUseImportDeviceFormLogicReturnType = {
    formTitle: t('device.import.formTitle'),
    formTitleVariant: 'h5',
    initialValues: {
      smartMeterId: '',
      timeZone: moreThanOneTimeZone ? [] : undefined,
      gridOperator: '',
      postalCode: '',
      region: [],
      subregion: [],
      description: '',
    },
    validationSchema: yup.object({
      smartMeterId: yup
        .string()
        .required()
        .label(smartMeterId || 'Smart meter ID'),
      timeZone: moreThanOneTimeZone
        ? yup.array().required().label(t('device.import.timezone'))
        : undefined,
      gridOperator: yup
        .string()
        .required()
        .label(t('device.import.gridOperator')),
      postalCode: yup.string().required().label(t('device.import.postalCode')),
      region: yup.array().required().label(t('device.import.region')),
      subregion: yup.array().required().label(t('device.import.subregion')),
      description: yup.string().label(t('device.import.description')),
    }),
    fields: [
      {
        name: 'smartMeterId',
        label: smartMeterId || 'Smart meter ID',
        required: true,
        inputProps: { ['data-cy']: 'smartMeterId' },
      },
      {
        name: 'gridOperator',
        label: t('device.import.gridOperator'),
        required: true,
        select: true,
        options: gridOperatorOptions,
        inputProps: { ['data-cy']: 'gridOperator' },
      },
      {
        name: 'postalCode',
        label: t('device.import.postalCode'),
        required: true,
        inputProps: { ['data-cy']: 'postalCode' },
      },
      {
        name: 'region',
        label: t('device.import.region'),
        required: true,
        select: true,
        autocomplete: true,
        options: prepareRegionsOption(allRegions),
        inputProps: { ['data-cy']: 'region' },
      },
      {
        name: 'subregion',
        label: t('device.import.subregion'),
        select: true,
        required: true,
        autocomplete: true,
        dependentOn: 'region',
        dependentOptionsCallback: prepareSubregionOptions(allRegions),
        inputProps: { ['data-cy']: 'subregion' },
      },
      {
        name: 'description',
        label: t('device.import.description'),
        inputProps: { ['data-cy']: 'description' },
        textFieldProps: {
          multiline: true,
          rows: 2,
        },
      },
    ],
    inputsVariant: 'filled',
    secondaryButtons: [
      {
        variant: 'outlined',
        style: { marginRight: 20 },
        label: t('general.buttons.cancel'),
        onClick: handleClose,
      },
    ],
    buttonText: t('device.import.saveData'),
    buttonProps: { ['data-cy']: 'saveDataButton' },
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
