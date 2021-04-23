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

export type SignatoryInfoFormValues = {
  signatoryAddress: string;
  signatoryCity: string;
  signatoryCountry: string;
  signatoryEmail: string;
  signatoryFullName: string;
  signatoryTelephone: string;
  signatoryZipCode: string;
};

export type FormUnionType =
  | OrganizationInfoFormValues
  | SignatoryInfoFormValues;

export type FormMergedType = OrganizationInfoFormValues &
  SignatoryInfoFormValues;
