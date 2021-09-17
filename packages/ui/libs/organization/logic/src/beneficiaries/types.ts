import { GenericFormProps, FormSelectOption } from '@energyweb/origin-ui-core';

export type TCreateBeneficiaryFormValues = {
  name: string;
  countryCode: FormSelectOption[];
  location: string;
};

export type TUseCreateBeneficiaryFormLogic = () => Omit<
  GenericFormProps<TCreateBeneficiaryFormValues>,
  'submitHandler'
>;
