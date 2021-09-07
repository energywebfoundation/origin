import axios from 'axios';
import { ApiDownloadFunction } from '../types';

export const fileDownloadHandler = async (id: string) => {
  return await axios.get(`api/file/${id}`);
};

export const downloadFileHandler = async (id: string, name: string) => {
  try {
    const downloadFunc: ApiDownloadFunction = fileDownloadHandler;
    const response = await downloadFunc(id);

    if (response) {
      const imageType = response.headers['content-type'];
      const blob = new Blob(
        [Buffer.from((response.data.data as unknown) as string)],
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
