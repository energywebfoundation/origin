import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TCreateSignatoryInfoForm } from './types';

export const createSignatoryInfoForm: TCreateSignatoryInfoForm = (t) => ({
  formTitle: t('organization.register.signatoryFormTitle'),
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    signatoryFullName: '',
    signatoryAddress: '',
    signatoryZipCode: '',
    signatoryCity: '',
    signatoryCountry: [],
    signatoryEmail: '',
    signatoryPhoneNumber: '',
  },
  validationSchema: yup.object().shape({
    signatoryFullName: yup
      .string()
      .required()
      .label(t('organization.register.signatoryName')),
    signatoryAddress: yup
      .string()
      .required()
      .label(t('organization.register.signatoryAddress')),
    signatoryZipCode: yup
      .string()
      .required()
      .label(t('organization.register.signatoryZipCode')),
    signatoryCity: yup
      .string()
      .required()
      .label(t('organization.register.signatoryCity')),
    signatoryCountry: yup
      .array()
      .required()
      .label(t('organization.register.signatoryCountry')),
    signatoryEmail: yup
      .string()
      .email()
      .required()
      .label(t('organization.register.signatoryEmail')),
    signatoryPhoneNumber: yup
      .string()
      .required()
      .label(t('organization.register.signatoryPhoneNumber')),
  }),
  fields: [
    {
      name: 'signatoryFullName',
      label: t('organization.register.signatoryName'),
      required: true,
    },
    {
      name: 'signatoryAddress',
      label: t('organization.register.signatoryAddress'),
      required: true,
    },
    {
      name: 'signatoryZipCode',
      label: t('organization.register.signatoryZipCode'),
      required: true,
    },
    {
      name: 'signatoryCity',
      label: t('organization.register.signatoryCity'),
      required: true,
    },
    {
      name: 'signatoryCountry',
      label: t('organization.register.signatoryCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
      required: true,
    },
    {
      name: 'signatoryEmail',
      label: t('organization.register.signatoryEmail'),
      required: true,
    },
    {
      name: 'signatoryPhoneNumber',
      label: t('organization.register.signatoryPhoneNumber'),
      required: true,
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
