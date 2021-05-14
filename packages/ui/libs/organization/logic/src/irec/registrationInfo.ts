import * as yup from 'yup';
import {
  COUNTRY_OPTIONS_ISO,
  NUMBER_OF_EMPLOYEES_OPTIONS,
  createIRecAccountTypeOptions,
} from '../select-options';
import { TCreateIRecRegistrationInfoForm } from './types';

export const createIRecRegistrationInfoForm: TCreateIRecRegistrationInfoForm = (
  t
) => ({
  formTitle: t('organization.registerIRec.registrationInfoFormTitle'),
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    accountType: null,
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
      .number()
      .required()
      .label(t('organization.registerIRec.IRECAccountType')),
    headquarterCountry: yup
      .string()
      .required()
      .label(t('organization.registerIRec.orgHeadquartersCountry')),
    registrationYear: yup
      .number()
      .transform((value) => (isNaN(value) ? 0 : value))
      .min(1900)
      .required()
      .label(t('organization.registerIRec.yearOfregisterIRec')),
    employeesNumber: yup
      .string()
      .required()
      .label(t('organization.registerIRec.numberOfEmployees')),
    shareholders: yup
      .string()
      .required()
      .label(t('organization.registerIRec.shareholderNames')),
    website: yup
      .string()
      .url()
      .required()
      .label(t('organization.registerIRec.orgWebsite')),
    activeCountries: yup
      .array()
      .required()
      .label(t('organization.registerIRec.activeCountries')),
    mainBusiness: yup
      .string()
      .required()
      .label(t('organization.registerIRec.mainBusiness')),
    ceoName: yup
      .string()
      .required()
      .label(t('organization.registerIRec.ceoName')),
    ceoPassportNumber: yup
      .string()
      .required()
      .label(t('organization.registerIRec.ceoPassport')),
    balanceSheetTotal: yup
      .string()
      .required()
      .label(t('organization.registerIRec.lastBalance')),
  }),
  fields: [
    {
      name: 'accountType',
      label: t('organization.registerIRec.IRECAccountType'),
      select: true,
      options: createIRecAccountTypeOptions(t),
    },
    {
      name: 'headquarterCountry',
      label: t('organization.registerIRec.orgHeadquartersCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'registrationYear',
      label: t('organization.registerIRec.yearOfregisterIRec'),
    },
    {
      name: 'employeesNumber',
      label: t('organization.registerIRec.numberOfEmployees'),
      select: true,
      options: NUMBER_OF_EMPLOYEES_OPTIONS,
    },
    {
      name: 'shareholders',
      label: t('organization.registerIRec.shareholderNames'),
    },
    {
      name: 'website',
      label: t('organization.registerIRec.orgWebsite'),
    },
    {
      name: 'activeCountries',
      label: t('organization.registerIRec.activeCountries'),
      select: true,
      options: COUNTRY_OPTIONS_ISO,
      autocomplete: true,
      multiple: true,
      maxValues: 3,
    },
    {
      name: 'mainBusiness',
      label: t('organization.registerIRec.mainBusiness'),
    },
    {
      name: 'ceoName',
      label: t('organization.registerIRec.ceoName'),
    },
    {
      name: 'ceoPassportNumber',
      label: t('organization.registerIRec.ceoPassport'),
    },
    {
      name: 'balanceSheetTotal',
      label: t('organization.registerIRec.balanceSheetTotal'),
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
