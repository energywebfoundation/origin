import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';

export const prepareRegionsOption = (
  allRegions: ConfigurationDTORegions
): FormSelectOption[] => {
  const regionsOptions = allRegions
    ? Object.keys(allRegions).map((region) => ({
        value: region,
        label: region,
      }))
    : [];

  return regionsOptions;
};
