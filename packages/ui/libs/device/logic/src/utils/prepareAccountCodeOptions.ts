import { FormSelectOption } from '@energyweb/origin-ui-core';
import {
  IrecAccountDto,
  IrecAccountDtoType,
} from '@energyweb/origin-organization-irec-api-react-query-client';

export const prepareAccountCodeOptions = (
  myAccounts: IrecAccountDto[]
): FormSelectOption[] => {
  if (!myAccounts) {
    return [];
  }

  const options: FormSelectOption[] = myAccounts
    .filter((account) => account.type === IrecAccountDtoType.Trade)
    .map((account) => ({
      value: account.code,
      label: account.code,
    }));
  return options;
};
