import { useBlockchainPropertiesControllerGet } from '@energyweb/issuer-irec-api-react-query-client';
import { useAuthIsAuthenticated } from '@energyweb/origin-ui-react-query-providers';

export const useApiFetchUserBlockchainPropertiesData = () => {
  const isAuthenticated = useAuthIsAuthenticated();
  const { isLoading, error, isError, isSuccess, isFetched, data } =
    useBlockchainPropertiesControllerGet({
      enabled: isAuthenticated,
    });

  return {
    isLoading,
    isSuccess,
    isError,
    isFetched,
    error,
    data,
  };
};
