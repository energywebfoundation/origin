import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareSubRegionsOptions = (
  allRegions: Record<string, string[]>,
  country: string,
  selectedRegionsOptions: FormSelectOption[]
) => {
  const selectedRegionsValues = selectedRegionsOptions?.map(
    (option) => option.value
  );

  const subregionsOption = selectedRegionsValues?.flatMap((region) => {
    const matchingSubregions: string[] = allRegions[region];
    const options: FormSelectOption[] = matchingSubregions?.map(
      (subregion) => ({
        label: `${region} - ${subregion}`,
        value: `${country};${region};${subregion}`,
      })
    );
    return options;
  });

  return subregionsOption;
};
