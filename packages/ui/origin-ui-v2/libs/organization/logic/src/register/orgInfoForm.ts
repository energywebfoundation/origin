import * as yup from 'yup';
import {
  BUSINESS_LEGAL_TYPE_OPTIONS,
  COUNTRY_OPTIONS_ISO,
} from '../select-options';
import { TCreateOrgInfoForm } from './types';

export const createOrgInfoForm: TCreateOrgInfoForm = (t) => ({
  formTitle: t('organization.register.orgInfoTitle'),
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    name: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
    businessType: '',
    tradeRegistryCompanyNumber: '',
    vatNumber: '',
  },
  validationSchema: yup.object().shape({
    name: yup.string().required().label(t('organization.register.orgInfoName')),
    address: yup
      .string()
      .required()
      .label(t('organization.register.orgInfoAddress')),
    zipCode: yup
      .string()
      .required()
      .label(t('organization.register.orgInfozipCode')),
    city: yup.string().required().label(t('organization.register.orgInfoCity')),
    country: yup
      .string()
      .required()
      .label(t('organization.register.orgInfoCountry')),
    businessType: yup
      .string()
      .required()
      .label(t('organization.register.orgInfoBusinessType')),
    tradeRegistryCompanyNumber: yup
      .string()
      .required()
      .label(t('organization.register.orgInfoTradeRegistryCompanyNumber')),
    vatNumber: yup
      .string()
      .required()
      .label(t('organization.register.orgInfoVatNumber')),
  }),
  fields: [
    {
      name: 'name',
      label: t('organization.register.orgInfoName'),
    },
    {
      name: 'address',
      label: t('organization.register.orgInfoAddress'),
    },
    {
      name: 'zipCode',
      label: t('organization.register.orgInfozipCode'),
    },
    {
      name: 'city',
      label: t('organization.register.orgInfoCity'),
    },
    {
      name: 'country',
      label: t('organization.register.orgInfoCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'businessType',
      label: t('organization.register.orgInfoBusinessType'),
      select: true,
      options: BUSINESS_LEGAL_TYPE_OPTIONS,
    },
    {
      name: 'tradeRegistryCompanyNumber',
      label: t('organization.register.orgInfoTradeRegistryCompanyNumber'),
    },
    {
      name: 'vatNumber',
      label: t('organization.register.orgInfoVatNumber'),
    },
  ],
  buttonText: t('form.nextStep'),
});
