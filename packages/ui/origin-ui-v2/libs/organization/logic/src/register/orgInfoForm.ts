// @should-localize
import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import * as yup from 'yup';
import {
  BUSINESS_LEGAL_TYPE_OPTIONS,
  COUNTRY_OPTIONS_ISO,
} from '../select-options';
import { OrganizationInfoFormValues } from './types';

export const orgInfoForm: MultiStepFormItem<OrganizationInfoFormValues> = {
  formTitle: 'Organization Information',
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
    name: yup.string().required('Organization Name is a required field'),
    address: yup.string().required('Organization Address is a required field'),
    zipCode: yup.string().required('Zip Code is a required field'),
    city: yup.string().required('City is a required field'),
    country: yup.string().required('Country is a required field'),
    businessType: yup.string().required('Business Type is a required field'),
    tradeRegistryCompanyNumber: yup
      .string()
      .required('Trade Registry Company Number is a required field'),
    vatNumber: yup.string().required('VAT Number is a required field'),
  }),
  fields: [
    {
      name: 'name',
      label: 'Organization Name',
    },
    {
      name: 'address',
      label: 'Organization Address',
    },
    {
      name: 'zipCode',
      label: 'Zip Code',
    },
    {
      name: 'city',
      label: 'City',
    },
    {
      name: 'country',
      label: 'Country',
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'businessType',
      label: 'Business Type',
      select: true,
      options: BUSINESS_LEGAL_TYPE_OPTIONS,
    },
    {
      name: 'tradeRegistryCompanyNumber',
      label: 'Trade Registry Company Number',
    },
    {
      name: 'vatNumber',
      label: 'VAT Number',
    },
  ],
  buttonText: 'Next step',
};
