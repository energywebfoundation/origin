import { fileControllerUpload } from '@energyweb/origin-backend-react-query-client';

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
