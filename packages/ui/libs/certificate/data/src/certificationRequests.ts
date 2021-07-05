import {
  useCertificationRequestControllerGetAll,
  FullCertificationRequestDTO,
} from '@energyweb/issuer-irec-api-react-query-client';

export const useCertificationRequests = () => {
  const { data, isLoading } = useCertificationRequestControllerGetAll();

  const requests = data ?? ([] as FullCertificationRequestDTO[]);

  return { requests, isLoading };
};
