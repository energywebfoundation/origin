import { AUTHENTICATION_TOKEN } from '../utils';
import {
  TGetAuthenticationToken,
  TRemoveAutheticationToken,
  TSetAuthenticationToken,
} from './types';

export const setAuthenticationToken: TSetAuthenticationToken = (token) => {
  localStorage.setItem(AUTHENTICATION_TOKEN, token);
};

export const getAuthenticationToken: TGetAuthenticationToken = () => {
  return localStorage.getItem(AUTHENTICATION_TOKEN);
};

export const removeAuthenticationToken: TRemoveAutheticationToken = () => {
  localStorage.removeItem(AUTHENTICATION_TOKEN);
};
