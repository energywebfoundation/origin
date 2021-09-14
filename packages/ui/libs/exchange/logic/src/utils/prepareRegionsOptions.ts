import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareRegionsOptions = (
  allRegions: ConfigurationDTORegions
): FormSelectOption[] => {
  const allRegionsOptions = allRegions
    ? Object.keys(allRegions).map((region) => ({
        value: region,
        label: region,
      }))
    : [];

  return allRegionsOptions;
};
