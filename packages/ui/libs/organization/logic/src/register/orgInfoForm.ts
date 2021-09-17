import * as yup from 'yup';
import { BUSINESS_LEGAL_TYPE_OPTIONS } from '../select-options';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
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
    country: [],
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
      .label(t('organization.register.orgInfoZipCode')),
    city: yup.string().required().label(t('organization.register.orgInfoCity')),
    country: yup
      .array()
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
      required: true,
    },
    {
      name: 'address',
      label: t('organization.register.orgInfoAddress'),
      required: true,
    },
    {
      name: 'zipCode',
      label: t('organization.register.orgInfoZipCode'),
      required: true,
    },
    {
      name: 'city',
      label: t('organization.register.orgInfoCity'),
      required: true,
    },
    {
      name: 'country',
      label: t('organization.register.orgInfoCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
      required: true,
    },
    {
      name: 'businessType',
      label: t('organization.register.orgInfoBusinessType'),
      select: true,
      options: BUSINESS_LEGAL_TYPE_OPTIONS,
      required: true,
    },
    {
      name: 'tradeRegistryCompanyNumber',
      label: t('organization.register.orgInfoTradeRegistryCompanyNumber'),
      required: true,
    },
    {
      name: 'vatNumber',
      label: t('organization.register.orgInfoVatNumber'),
      required: true,
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
