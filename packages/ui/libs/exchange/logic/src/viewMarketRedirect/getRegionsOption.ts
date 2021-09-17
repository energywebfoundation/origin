import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import { prepareRegionsOptions } from '../utils';

export const getRegionOption = (
  location: string[],
  allRegions: ConfigurationDTORegions
) => {
  const regions = location.map((loc) => loc.split(';')[1]);

  const allOptions = prepareRegionsOptions(allRegions);

  const selectedOptions = allOptions.filter((option) =>
    regions.includes(option.value as string)
  );

  return selectedOptions;
};
