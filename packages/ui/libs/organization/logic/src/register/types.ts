import {
  FormSelectOption,
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
  country: FormSelectOption[];
  tradeRegistryCompanyNumber: string;
  vatNumber: string;
};

export type TCreateOrgInfoForm = (
  t: TFunction
) => MultiStepFormItem<OrganizationInfoFormValues>;

export type SignatoryInfoFormValues = {
  signatoryAddress: string;
  signatoryCity: string;
  signatoryCountry: FormSelectOption[];
  signatoryEmail: string;
  signatoryFullName: string;
  signatoryPhoneNumber: string;
  signatoryZipCode: string;
};

export type TCreateSignatoryInfoForm = (
  t: TFunction
) => MultiStepFormItem<SignatoryInfoFormValues>;

export type DocsUploadFormValues = {
  signatoryDocumentIds: string[];
  documentIds: string[];
};

export type TCreateDocsUploadForm = (
  t: TFunction
) => MultiStepFormItem<DocsUploadFormValues>;

export type FormUnionType =
  | OrganizationInfoFormValues
  | SignatoryInfoFormValues
  | DocsUploadFormValues;

export type FormMergedType = OrganizationInfoFormValues &
  SignatoryInfoFormValues &
  DocsUploadFormValues;

export type TUseRegisterOrganizationFormLogic = () => Omit<
  MultiStepFormProps<FormMergedType>,
  'submitHandler'
>;
