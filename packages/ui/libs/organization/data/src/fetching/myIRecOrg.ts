import { useRegistrationControllerGetRegistrations } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useMyIRecOrganizationData = () => {
  const {
    isLoading: iRecOrgLoading,
    data,
  } = useRegistrationControllerGetRegistrations();

  return { iRecOrgLoading, iRecOrganization: !iRecOrgLoading && data[0] };
};
