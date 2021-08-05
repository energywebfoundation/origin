import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { gridOperatorOptions } from '../utils';
import { TUseImportDeviceFormLogic } from './types';

export const useImportDeviceFormLogic: TUseImportDeviceFormLogic = (
  handleClose
) => {
  const { t } = useTranslation();

  return {
    formTitle: t('device.import.formTitle'),
    formTitleVariant: 'h5',
    initialValues: {
      smartMeterId: '',
      timezone: '',
      gridOperator: '',
      postalCode: '',
      region: '',
      subregion: '',
      description: '',
    },
    validationSchema: yup.object({
      smartMeterId: yup
        .string()
        .required()
        .label(process.env.NX_SMART_METER_ID || 'Smart meter ID'),
      timezone: yup.string().required().label(t('device.import.timezone')),
      gridOperator: yup
        .string()
        .required()
        .label(t('device.import.gridOperator')),
      postalCode: yup.string().required().label(t('device.import.postalCode')),
      region: yup.string().required().label(t('device.import.region')),
      subregion: yup.string().required().label(t('device.import.subregion')),
      description: yup.string().label(t('device.import.description')),
    }),
    fields: [
      {
        name: 'smartMeterId',
        label: process.env.NX_SMART_METER_ID || 'Smart meter ID',
        required: true,
      },
      {
        name: 'timezone',
        label: t('device.import.timezone'),
        required: true,
      },
      {
        name: 'gridOperator',
        label: t('device.import.gridOperator'),
        required: true,
        select: true,
        options: gridOperatorOptions,
      },
      {
        name: 'postalCode',
        label: t('device.import.postalCode'),
        required: true,
      },
      {
        name: 'region',
        label: t('device.import.region'),
        required: true,
      },
      {
        name: 'subregion',
        label: t('device.import.subregion'),
        required: true,
      },
      {
        name: 'description',
        label: t('device.import.description'),
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
  };
};
