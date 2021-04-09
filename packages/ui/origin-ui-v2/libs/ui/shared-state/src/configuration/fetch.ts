import { TConfigurationResponse, TFetchConfiguration } from './types';

export const fetchConfiguration: TFetchConfiguration = async (options) => {
  const { url, fetchFunc } = options;

  try {
    if (fetchFunc) {
      return await fetchFunc();
    }

    const response: TConfigurationResponse = await fetch(url);
    const config = await response.json();
    return config;
  } catch (error) {
    console.warn('Error while fetching configuration', error?.message ?? error);
  }
};
