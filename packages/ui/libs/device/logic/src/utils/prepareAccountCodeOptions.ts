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
    .map((type) => ({
      value: type.code,
      label: type.details.name,
    }));
  return options;
};
