import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
import { useRegistrationControllerGetRegistrations } from '@energyweb/origin-organization-irec-api-react-query-client';
import axios from 'axios';

export const useMyOrganizationData = () => {
  const { isLoading: organizationLoading, data: user } = useUserControllerMe();

  const organization = user?.organization;
  return { organizationLoading, organization };
};

export const useMyIRecOrganizationData = () => {
  const { isLoading: iRecOrgLoading, data } =
    useRegistrationControllerGetRegistrations();

  return { iRecOrgLoading, iRecOrganization: !iRecOrgLoading && data[0] };
};

export const fileUDownloadHandler = async (id: string) => {
  return await axios.get(`api/file/${id}`);
};
