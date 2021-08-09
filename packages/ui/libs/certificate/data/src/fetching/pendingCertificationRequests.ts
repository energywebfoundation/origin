import { useCertificationRequests } from './certificationRequests';

export const useApiPendingRequests = () => {
  const { requests, isLoading } = useCertificationRequests();
  const pendingRequests = requests.filter(
    (request) => request.revokedDate === null && request.approvedDate === null
  );

  return { pendingRequests, isLoading };
};
