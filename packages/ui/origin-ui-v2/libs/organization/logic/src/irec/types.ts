import { FormSelectOption } from '@energyweb/origin-ui-core';

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

export type LeadUserDetailsForms = {
  leadUserTitle: string;
  leadUserTitleInput?: string;
  leadUserFirstName: string;
  leadUserLastName: string;
  leadUserEmail: string;
  leadUserPhoneNumber: string;
  leadUserFax: string;
};

export type FormUnionType =
  | IRecRegistrationInfoForm
  | PrimaryContactDetailsForms
  | LeadUserDetailsForms;

export type FormMergedType = IRecRegistrationInfoForm &
  PrimaryContactDetailsForms &
  LeadUserDetailsForms;
