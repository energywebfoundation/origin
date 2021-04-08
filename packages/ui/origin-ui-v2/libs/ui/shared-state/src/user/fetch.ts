import { TFetchUser } from './types';

export const fetchUser: TFetchUser = async (options) => {
  const { url, fetchFunc } = options;
  try {
    if (fetchFunc) {
      return await fetchFunc();
    }

    const response = await fetch(url);
    const user = await response.json();
    return user;
  } catch (error) {
    console.warn('Error while fetching user', error?.message ?? error);
  }
};
