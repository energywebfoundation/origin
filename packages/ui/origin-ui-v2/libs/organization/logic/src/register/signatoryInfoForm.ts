import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '../select-options';
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
    signatoryCountry: '',
    signatoryEmail: '',
    signatoryTelephone: '',
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
      .string()
      .required()
      .label(t('organization.register.signatoryCountry')),
    signatoryEmail: yup
      .string()
      .email()
      .required()
      .label(t('organization.register.signatoryEmail')),
    signatoryTelephone: yup
      .string()
      .required()
      .label(t('organization.register.signatoryTelephone')),
  }),
  fields: [
    {
      name: 'signatoryFullName',
      label: t('organization.register.signatoryName'),
    },
    {
      name: 'signatoryAddress',
      label: t('organization.register.signatoryAddress'),
    },
    {
      name: 'signatoryZipCode',
      label: t('organization.register.signatoryZipCode'),
    },
    {
      name: 'signatoryCity',
      label: t('organization.register.signatoryCity'),
    },
    {
      name: 'signatoryCountry',
      label: t('organization.register.signatoryCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'signatoryEmail',
      label: t('organization.register.signatoryEmail'),
    },
    {
      name: 'signatoryTelephone',
      label: t('organization.register.signatoryTelephone'),
    },
  ],
  buttonText: t('form.submit'),
});
