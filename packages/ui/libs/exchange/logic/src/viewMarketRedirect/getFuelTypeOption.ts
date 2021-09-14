import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { sortedUniq } from 'lodash';
import { prepareFuelTypesOptions } from '../utils';

export const getFuelTypeOptions = (
  deviceType: string[],
  allFuelTypes: CodeNameDTO[]
) => {
  const fuelTypes = deviceType.map((type) => type.split(';')[0]);
  const dedupedFuelTypes = sortedUniq(fuelTypes);

  const allOptions = prepareFuelTypesOptions(allFuelTypes);
  const matchedOptions = allOptions.filter((option) =>
    dedupedFuelTypes.includes(option.value as string)
  );

  return matchedOptions;
};
