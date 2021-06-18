import { TUseRegisterDeviceFormLogic } from './types';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  prepareDeviceTypesOptions,
  prepareFuelTypesOptions,
} from './prepareOptions';
import { gridOperatorOptions } from '../utils';

export const useRegisterDeviceFormLogic: TUseRegisterDeviceFormLogic = (
  allFuelTypes,
  allDeviceTypes,
  externalDeviceId
) => {
  const { t } = useTranslation();

  return {
    formTitle: t('device.register.formTitle'),
    formTitleVariant: 'h5',
    inputsVariant: 'filled',
    twoColumns: true,
    initialValues: {
      facilityName: '',
      fuelType: '',
      deviceType: '',
      commissioningDate: '',
      registrationDate: '',
      projectStory: '',
      smartMeterId: '',
      capacity: '',
      region: '',
      subregion: '',
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
      projectStory: yup.string(),
      smartMeterId: yup.string(),
      capacity: yup.string().required(
        t('validation.requiredField', {
          field: t('device.register.capacity'),
        })
      ),
      region: yup
        .string()
        .required(
          t('validation.requiredField', { field: t('device.register.region') })
        ),
      subregion: yup.string().required(
        t('validation.requiredField', {
          field: t('device.register.subregion'),
        })
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
      latitude: yup.string().required(
        t('validation.requiredField', {
          field: t('device.register.latitude'),
        })
      ),
      longitude: yup.string().required(
        t('validation.requiredField', {
          field: t('device.register.longitude'),
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
        name: 'projectStory',
        label: t('device.register.projectStory'),
        textFieldProps: {
          multiline: true,
          rows: 5,
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
        name: 'region',
        label: t('device.register.region'),
      },
      {
        name: 'subregion',
        label: t('device.register.subregion'),
      },
      {
        name: 'gridOperator',
        label: t('device.register.gridOperator'),
        select: true,
        options: gridOperatorOptions,
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
    buttonText: t('general.buttons.register'),
  };
};
