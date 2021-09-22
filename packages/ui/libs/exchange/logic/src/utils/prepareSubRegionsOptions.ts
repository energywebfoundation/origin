import { FormSelectOption } from '@energyweb/origin-ui-core';
import { Countries } from '@energyweb/utils-general';

export const prepareSubRegionsOptions = (
  allRegions: Record<string, string[]>,
  country: string,
  selectedRegionsOptions: FormSelectOption[]
) => {
  const selectedRegionsValues = selectedRegionsOptions?.map(
    (option) => option.value
  );

  const countryCode = Countries.find((cntr) => cntr.name === country)?.code;

  const subregionsOption = selectedRegionsValues?.flatMap((region) => {
    const matchingSubregions: string[] = allRegions[region];
    const options: FormSelectOption[] = matchingSubregions?.map(
      (subregion) => ({
        label: `${region} - ${subregion}`,
        value: `${countryCode};${region};${subregion}`,
      })
    );
    return options;
  });

  return subregionsOption;
};
