import {
  useUserControllerMe,
  fileControllerDownload,
} from '@energyweb/origin-backend-react-query-client';

export const useMyOrganizationData = () => {
  const {
    isLoading,
    data: { organization },
  } = useUserControllerMe();

  return { isLoading, organization };
};

export const fileUDownloadHandler = async (id: string) => {
  return await fileControllerDownload(id);
};
