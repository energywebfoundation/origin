import {
  FormSelectOption,
  MultiStepFormItem,
  MultiStepFormProps,
} from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type IRecRegistrationInfoForm = {
  accountType: string;
  headquarterCountry: string;
  registrationYear: string;
  employeesNumber: string;
  shareholders: string;
  website: string;
  activeCountries: FormSelectOption[];
  mainBusiness: string;
  ceoName: string;
  ceoPassportNumber: string;
  balanceSheetTotal: string;
};

export type TCreateIRecRegistrationInfoForm = (
  t: TFunction
) => MultiStepFormItem<IRecRegistrationInfoForm>;

export type PrimaryContactDetailsForms = {
  primaryContactOrganizationName: string;
  primaryContactOrganizationAddress: string;
  primaryContactOrganizationPostalCode: string;
  primaryContactOrganizationCountry: string;
  subsidiaries?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  primaryContactFax: string;
};

export type TCreatePrimaryContactDetailsForms = (
  t: TFunction
) => MultiStepFormItem<PrimaryContactDetailsForms>;

type LeadUserDetailsForms = {
  leadUserTitle: string;
  leadUserTitleInput?: string;
  leadUserFirstName: string;
  leadUserLastName: string;
  leadUserEmail: string;
  leadUserPhoneNumber: string;
  leadUserFax: string;
};

export type TCreateLeadUserDetailsForm = (
  t: TFunction
) => MultiStepFormItem<LeadUserDetailsForms>;

export type FormUnionType =
  | IRecRegistrationInfoForm
  | PrimaryContactDetailsForms
  | LeadUserDetailsForms;

export type FormMergedType = IRecRegistrationInfoForm &
  PrimaryContactDetailsForms &
  LeadUserDetailsForms;

export type TUseRegisterIRecFormLogic = (
  t: TFunction
) => MultiStepFormProps<FormUnionType, FormMergedType>['forms'];
