import {
  fileControllerUpload,
  fileControllerUploadAnonymously,
} from '@energyweb/origin-backend-react-query-client';

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};

export const publicFileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUploadAnonymously({ files: file });
};
