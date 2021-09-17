import * as yup from 'yup';
import {
  NUMBER_OF_EMPLOYEES_OPTIONS,
  createIRecAccountTypeOptions,
} from '../select-options';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TCreateIRecRegistrationInfoForm } from './types';

export const createIRecRegistrationInfoForm: TCreateIRecRegistrationInfoForm = (
  t
) => ({
  formTitle: t('organization.registerIRec.registrationInfoFormTitle'),
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    accountType: null,
    headquarterCountry: [],
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
      .array()
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
      required: true,
    },
    {
      name: 'headquarterCountry',
      label: t('organization.registerIRec.orgHeadquartersCountry'),
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
      required: true,
    },
    {
      name: 'registrationYear',
      label: t('organization.registerIRec.yearOfregisterIRec'),
      required: true,
    },
    {
      name: 'employeesNumber',
      label: t('organization.registerIRec.numberOfEmployees'),
      select: true,
      options: NUMBER_OF_EMPLOYEES_OPTIONS,
      required: true,
    },
    {
      name: 'shareholders',
      label: t('organization.registerIRec.shareholderNames'),
      required: true,
    },
    {
      name: 'website',
      label: t('organization.registerIRec.orgWebsite'),
      required: true,
    },
    {
      name: 'activeCountries',
      label: t('organization.registerIRec.activeCountries'),
      options: COUNTRY_OPTIONS_ISO,
      select: true,
      autocomplete: true,
      multiple: true,
      required: true,
      maxValues: 3,
    },
    {
      name: 'mainBusiness',
      label: t('organization.registerIRec.mainBusiness'),
      required: true,
    },
    {
      name: 'ceoName',
      label: t('organization.registerIRec.ceoName'),
      required: true,
    },
    {
      name: 'ceoPassportNumber',
      label: t('organization.registerIRec.ceoPassport'),
      required: true,
    },
    {
      name: 'balanceSheetTotal',
      label: t('organization.registerIRec.balanceSheetTotal'),
      required: true,
    },
  ],
  buttonText: t('general.buttons.nextStep'),
});
