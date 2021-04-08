import { isEmpty } from 'lodash';
import {
  ORIGIN_USER,
  getFromLocalStorage,
  removeFromLocalStorage,
} from '../utils';
import { fetchUser } from './fetch';
import { TFetchAndSetUser, TGetOriginUser, TRemoveOriginUser } from './types';

export const getUser: TGetOriginUser = getFromLocalStorage(ORIGIN_USER);

export const removeUser: TRemoveOriginUser = removeFromLocalStorage(
  ORIGIN_USER
);

const fetchAndSetUser: TFetchAndSetUser = async (options) => {
  const user = await fetchUser(options);
  localStorage.setItem(ORIGIN_USER, JSON.stringify(user));
};

export const setUser: TFetchAndSetUser = async (options) => {
  const existingUser = getUser();
  if (!!existingUser && !isEmpty(existingUser)) {
    return;
  }

  await fetchAndSetUser(options);
};
