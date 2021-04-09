import { isEmpty } from 'lodash';
import {
  ORIGIN_ENVIRONMENT,
  getFromLocalStorage,
  removeFromLocalStorage,
} from '../utils';
import { fetchEnvironment } from './fetch';
import {
  TFetchAndSetEnvironment,
  TGetEnvironment,
  TRemoveEnvironment,
} from './types';

const clearEnvironment: TRemoveEnvironment = removeFromLocalStorage(
  ORIGIN_ENVIRONMENT
);

const fetchAndSetEnvironment: TFetchAndSetEnvironment = async (configUrl) => {
  const environment = await fetchEnvironment(configUrl);
  localStorage.setItem(ORIGIN_ENVIRONMENT, JSON.stringify(environment));
};

export const getEnvironment: TGetEnvironment = getFromLocalStorage(
  ORIGIN_ENVIRONMENT
);

export const setAppEnvironment: TFetchAndSetEnvironment = async (configUrl) => {
  clearEnvironment();
  await fetchAndSetEnvironment(configUrl);
};

export const setPackageEnvironment: TFetchAndSetEnvironment = async (
  configUrl
) => {
  const existingEnv = getEnvironment();
  if (!isEmpty(existingEnv)) {
    return;
  }
  await fetchAndSetEnvironment(configUrl);
};
