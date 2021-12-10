import { GenericFormProps } from '@energyweb/origin-ui-core';
import { AccountDTO } from '@energyweb/origin-organization-irec-api-react-query-client';

export type RequestCertificateFormValues = {
  energy: string;
  fromTime: string;
  toTime: string;
  irecTradeAccountCode?: string;
};

export type TUseRequestCertificatesLogic = (
  myAccounts: AccountDTO[],
  singleAccountMode: boolean
) => Omit<GenericFormProps<RequestCertificateFormValues>, 'submitHandler'>;
