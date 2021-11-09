import { useConnectionControllerGetMyConnection } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useMyIRecConnection = () => {
  const { data: iRecConnection, isLoading } =
    useConnectionControllerGetMyConnection();

  return { iRecConnection, isLoading };
};
