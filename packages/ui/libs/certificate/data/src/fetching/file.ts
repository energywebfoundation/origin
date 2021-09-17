import axios from 'axios';

export const publicFileDownloadHandler = async (id: string) => {
  return await axios.get(`api/file/public/${id}`);
};
