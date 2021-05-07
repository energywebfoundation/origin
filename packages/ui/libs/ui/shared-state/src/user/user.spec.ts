import fetch from 'jest-fetch-mock';
import { ORIGIN_USER } from '../utils/constants';
import { userMock } from '../__mocks__/userMock';
import { getUser, removeUser, setUser } from './localStorage';

describe('User', () => {
  const stringUser = JSON.stringify(userMock);

  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
    fetch.mockResponse(stringUser);
  });

  it('should fetch and set user to localStorage', async () => {
    const userUrl = '/user/me';
    await setUser({ url: userUrl });

    expect(fetch.mock.calls.length).toEqual(1);
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      ORIGIN_USER,
      stringUser
    );
    expect(localStorage.__STORE__[ORIGIN_USER]).toBe(stringUser);

    await setUser({ url: userUrl });
    expect(fetch.mock.calls.length).toEqual(1);
  });

  it('should get user from localStorage', () => {
    localStorage.setItem(ORIGIN_USER, stringUser);

    const user = getUser();
    expect(user.email).toEqual(userMock.email);
    expect(user.organization.status).toEqual(userMock.organization.status);
  });

  it('should remove user from localStorage', () => {
    localStorage.setItem(ORIGIN_USER, stringUser);
    expect(localStorage.__STORE__[ORIGIN_USER]).toBe(stringUser);

    removeUser();
    expect(localStorage.__STORE__[ORIGIN_USER]).toBe(undefined);
  });
});
