import {
  MultiStepFormItem,
  MultiStepFormProps,
} from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type OrganizationInfoFormValues = {
  name: string;
  address: string;
  businessType: string;
  city: string;
  zipCode: string;
  country: string;
  tradeRegistryCompanyNumber: string;
  vatNumber: string;
};

export type TCreateOrgInfoForm = (
  t: TFunction
) => MultiStepFormItem<OrganizationInfoFormValues>;

export type SignatoryInfoFormValues = {
  signatoryAddress: string;
  signatoryCity: string;
  signatoryCountry: string;
  signatoryEmail: string;
  signatoryFullName: string;
  signatoryTelephone: string;
  signatoryZipCode: string;
};

export type TCreateSignatoryInfoForm = (
  t: TFunction
) => MultiStepFormItem<SignatoryInfoFormValues>;

export type FormUnionType =
  | OrganizationInfoFormValues
  | SignatoryInfoFormValues;

export type FormMergedType = OrganizationInfoFormValues &
  SignatoryInfoFormValues;

export type TUseRegisterOrganizationFormLogic = (
  t: TFunction
) => Omit<MultiStepFormProps<FormUnionType, FormMergedType>, 'submitHandler'>;
