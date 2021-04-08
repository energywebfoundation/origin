import { TFetchEnvironment } from './types';

export const fetchEnvironment: TFetchEnvironment = async (customUrl) => {
  try {
    const response = await fetch(customUrl ?? 'env-config.json');
    const environment = await response.json();
    return {
      ...environment,
      MARKET_UTC_OFFSET: parseInt(environment.MARKET_UTC_OFFSET, 10),
    };
  } catch (error) {
    console.warn(
      'Error while fetching env-config.json',
      error?.message ?? error
    );
  }
};
