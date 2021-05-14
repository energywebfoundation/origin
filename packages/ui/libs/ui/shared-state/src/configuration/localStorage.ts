import { isEmpty } from 'lodash';
import {
  ORIGIN_CONFIGURATION,
  getFromLocalStorage,
  removeFromLocalStorage,
} from '../utils';
import { fetchConfiguration } from './fetch';
import {
  TFetchAndSetConfiguration,
  TGetConfiguration,
  TRemoveConfiguration,
} from './types';

const clearConfiguration: TRemoveConfiguration = removeFromLocalStorage(
  ORIGIN_CONFIGURATION
);

const fetchAndSetConfiguration: TFetchAndSetConfiguration = async (options) => {
  const environment = await fetchConfiguration(options);
  localStorage.setItem(ORIGIN_CONFIGURATION, JSON.stringify(environment));
};

export const getConfiguration: TGetConfiguration = getFromLocalStorage(
  ORIGIN_CONFIGURATION
);

export const setAppConfiguration: TFetchAndSetConfiguration = async (
  options
) => {
  clearConfiguration();
  await fetchAndSetConfiguration(options);
};

export const setPackageConfiguration: TFetchAndSetConfiguration = async (
  options
) => {
  const existingConfig = getConfiguration();
  if (!isEmpty(existingConfig)) {
    return;
  }

  await fetchAndSetConfiguration(options);
};
