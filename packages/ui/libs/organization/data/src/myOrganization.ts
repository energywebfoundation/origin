import {
  useUserControllerMe,
  fileControllerDownload,
} from '@energyweb/origin-backend-react-query-client';

export const useMyOrganizationData = () => {
  const { isLoading, data } = useUserControllerMe();

  const organization = data?.data?.organization;

  return { isLoading, organization };
};

export const fileUDownloadHandler = async (id: string) => {
  return await fileControllerDownload(id);
};
