// @should-localize
import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import * as yup from 'yup';
import {
  COUNTRY_OPTIONS_ISO,
  NUMBER_OF_EMPLOYEES_OPTIONS,
  IREC_ACCOUNT_TYPE_OPTIONS,
} from '../select-options';
import { IRecRegistrationInfoForm } from './types';

export const registrationInfo: MultiStepFormItem<IRecRegistrationInfoForm> = {
  formTitle: 'I-REC Registration information',
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    accountType: '',
    headquarterCountry: '',
    registrationYear: '',
    employeesNumber: '',
    shareholders: '',
    website: '',
    activeCountries: [],
    mainBusiness: '',
    ceoName: '',
    ceoPassportNumber: '',
    balanceSheetTotal: '',
  },
  validationSchema: yup.object().shape({
    accountType: yup
      .string()
      .required()
      .label('organization.registration.IRECAccountType'),
    headquarterCountry: yup
      .string()
      .required()
      .label('organization.registration.orgHeadquartersCountry'),
    registrationYear: yup
      .number()
      .min(1900)
      .required()
      .label('organization.registration.yearOfRegistration'),
    employeesNumber: yup
      .string()
      .required()
      .label('organization.registration.numberOfEmployees'),
    shareholders: yup
      .string()
      .required()
      .label('organization.registration.shareholderNames'),
    website: yup
      .string()
      .url()
      .required()
      .label('organization.registration.orgWebsite'),
    activeCountries: yup
      .array()
      .required()
      .label('organization.registration.activeCountries'),
    mainBusiness: yup
      .string()
      .required()
      .label('organization.registration.mainBusiness'),
    ceoName: yup.string().required().label('organization.registration.ceoName'),
    ceoPassportNumber: yup
      .string()
      .required()
      .label('organization.registration.ceoPassport'),
    balanceSheetTotal: yup
      .string()
      .required()
      .label('organization.registration.lastBalance'),
  }),
  fields: [
    {
      name: 'accountType',
      label: 'IREC Account Type',
      select: true,
      options: IREC_ACCOUNT_TYPE_OPTIONS,
    },
    {
      name: 'headquarterCountry',
      label: 'Organization headquarter country',
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'registrationYear',
      label: 'Year of registration',
    },
    {
      name: 'employeesNumber',
      label: 'Number of employees',
      select: true,
      options: NUMBER_OF_EMPLOYEES_OPTIONS,
    },
    {
      name: 'shareholders',
      label: 'Shareholders names',
    },
    {
      name: 'website',
      label: 'Organization website',
    },
    {
      name: 'activeCountries',
      label: 'Active Countries',
      select: true,
      options: COUNTRY_OPTIONS_ISO,
      autocomplete: true,
      multiple: true,
      maxValues: 3,
    },
    {
      name: 'mainBusiness',
      label: 'Main business',
    },
    {
      name: 'ceoName',
      label: 'Name of the Chief Executive Officer/General Manager',
    },
    {
      name: 'ceoPassportNumber',
      label: 'Chief Executive Officer/General Manager passport number',
    },
    {
      name: 'balanceSheetTotal',
      label: 'Balance sheet total for last financial year',
    },
  ],
  buttonText: 'Next step',
};
