import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareSubregionOptions = (
  allRegions: Record<string, string[]>
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
