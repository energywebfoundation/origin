import { FormSelectOption } from '@energyweb/origin-ui-core';
import { prepareSubRegionsOptions } from '../utils';

export const getSubregionOption = (
  regionOptions: FormSelectOption[],
  location: string[],
  allRegions: Record<string, string[]>
) => {
  const country = location[0].split(';')[0];
  const allAvailableOptions = prepareSubRegionsOptions(
    allRegions,
    country,
    regionOptions
  );

  const selectedOptions = allAvailableOptions.filter((option) =>
    location.includes(option.value as string)
  );

  return selectedOptions;
};
