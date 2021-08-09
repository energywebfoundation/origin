import { useCertificationRequests } from './certificationRequests';

export const useApiApprovedCertificates = () => {
  const { requests, isLoading } = useCertificationRequests();
  const approvedCertificates = requests.filter((request) => request.approved);

  return { approvedCertificates, isLoading };
};
