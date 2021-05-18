import {
  fileControllerUpload,
  NewOrganizationDTO,
  useOrganizationControllerRegister,
} from '@energyweb/origin-backend-react-query-client';

export const useOrganizationRegisterHandler = () => {
  const { mutate } = useOrganizationControllerRegister();

  return (values: NewOrganizationDTO) => mutate({ data: values });
};

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
