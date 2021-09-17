import axios from 'axios';

export const fileDownloadHandler = async (id: string) => {
  return await axios.get(`api/file/${id}`);
};

export const publicFileDownloadHandler = async (id: string) => {
  return await axios.get(`api/file/public/${id}`);
};
