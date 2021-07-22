import { AUTHENTICATION_TOKEN } from '../utils';
import {
  getAuthenticationToken,
  removeAuthenticationToken,
  setAuthenticationToken,
} from './localStorage';

describe('Authentication Token', () => {
  const testToken = 'test_auth_token';

  it('should set token to local storage', () => {
    setAuthenticationToken(testToken);

    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      AUTHENTICATION_TOKEN,
      testToken
    );
    expect(localStorage.__STORE__[AUTHENTICATION_TOKEN]).toEqual(testToken);
  });

  it('should get token from local storage', () => {
    localStorage.setItem(AUTHENTICATION_TOKEN, testToken);
    const tokenFromStorage = getAuthenticationToken();

    expect(localStorage.getItem).toHaveBeenLastCalledWith(AUTHENTICATION_TOKEN);
    expect(tokenFromStorage).toEqual(testToken);
  });

  it('should remove token from local storage', () => {
    localStorage.setItem(AUTHENTICATION_TOKEN, testToken);
    const tokenFromStorage = getAuthenticationToken();
    expect(localStorage.getItem).toHaveBeenLastCalledWith(AUTHENTICATION_TOKEN);
    expect(tokenFromStorage).toEqual(testToken);

    removeAuthenticationToken();
    expect(localStorage.removeItem).toHaveBeenLastCalledWith(
      AUTHENTICATION_TOKEN
    );
    expect(localStorage.__STORE__[AUTHENTICATION_TOKEN]).toEqual(undefined);
  });
});
