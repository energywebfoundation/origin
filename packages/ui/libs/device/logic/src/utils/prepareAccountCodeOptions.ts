import { FormSelectOption } from '@energyweb/origin-ui-core';
import {
  AccountDTO,
  AccountDTOType,
} from '@energyweb/origin-organization-irec-api-react-query-client';

export const prepareAccountCodeOptions = (
  myAccounts: AccountDTO[]
): FormSelectOption[] => {
  if (!myAccounts) {
    return [];
  }

  const options: FormSelectOption[] = myAccounts
    .filter((account) => account.type === AccountDTOType.Trade)
    .map((account) => ({
      value: account.code,
      label: account.code,
    }));
  return options;
};
