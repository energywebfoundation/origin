import { useConfigurationControllerGet } from '@energyweb/origin-backend-react-query-client';

export const useApiRegionsConfiguration = () => {
  const { data, isLoading } = useConfigurationControllerGet();

  const allRegions = data?.regions;
  const country = data?.countryName;

  return { allRegions, country, isLoading };
};
