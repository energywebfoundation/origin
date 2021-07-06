import { fileControllerDownload } from '@energyweb/origin-backend-react-query-client';
import { ApiDownloadFunction } from './types';

export const fileUDownloadHandler = async (id: string) => {
  return await fileControllerDownload(id);
};

export const downloadFileHandler = async (id: string, name: string) => {
  try {
    const downloadFunc: ApiDownloadFunction = fileUDownloadHandler;
    const response = await downloadFunc(id);

    if (response) {
      const imageType = response.headers['content-type'];
      const blob = new Blob(
        [Buffer.from(response.data.data as unknown as string)],
        {
          type: imageType,
        }
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.log(error);
  }
};
