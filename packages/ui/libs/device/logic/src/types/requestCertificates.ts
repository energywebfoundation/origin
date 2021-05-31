import { GenericFormProps } from '@energyweb/origin-ui-core';

type RequestCertificateFormValues = {
  energy: string;
  fromTime: string;
  toTime: string;
};

export type TUseRequestCertificatesLogic = () => Omit<
  GenericFormProps<RequestCertificateFormValues>,
  'submitHandler'
>;
