import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareFuelTypesOptions = (
  allFuelTypes: CodeNameDTO[]
): FormSelectOption[] => {
  if (!allFuelTypes) {
    return [];
  }

  const options: FormSelectOption[] = allFuelTypes.map((type) => ({
    value: type.code,
    label: type.name,
  }));
  return options;
};
