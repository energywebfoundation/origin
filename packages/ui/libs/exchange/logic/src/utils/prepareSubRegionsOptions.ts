import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareSubRegionsOptions = (
  allRegions: ConfigurationDTORegions,
  country: string,
  selectedRegionsOptions: FormSelectOption[]
) => {
  const selectedRegionsValues = selectedRegionsOptions?.map(
    (option) => option.value
  );

  const subregionsOption = selectedRegionsValues?.flatMap((region) => {
    const matchingSubregions = allRegions[region];
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
