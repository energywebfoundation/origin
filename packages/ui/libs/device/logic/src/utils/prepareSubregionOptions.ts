import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareSubregionOptions = (
  allRegions: ConfigurationDTORegions
): ((selected: FormSelectOption[]) => FormSelectOption[]) => {
  return (selectedRegion: FormSelectOption[]) => {
    if (!selectedRegion) {
      return [];
    }
    const selectedValue = selectedRegion[0]?.value;
    const availableSubregions: string[] = allRegions[selectedValue];
    const options: FormSelectOption[] = availableSubregions?.map(
      (subregion) => ({
        value: subregion,
        label: subregion,
      })
    );
    return options;
  };
};
