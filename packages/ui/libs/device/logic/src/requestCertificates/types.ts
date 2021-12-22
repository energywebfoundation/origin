import { GenericFormProps } from '@energyweb/origin-ui-core';
import { IrecAccountDto } from '@energyweb/origin-organization-irec-api-react-query-client';

export type RequestCertificateFormValues = {
  energy: string;
  fromTime: string;
  toTime: string;
  irecTradeAccountCode?: string;
};

export type TUseRequestCertificatesLogic = (
  myAccounts: IrecAccountDto[],
  singleAccountMode: boolean
) => Omit<GenericFormProps<RequestCertificateFormValues>, 'submitHandler'>;
