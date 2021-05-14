import fetch from 'jest-fetch-mock';
import { ORIGIN_ENVIRONMENT } from '../utils/constants';
import { envMock } from '../__mocks__/envMock';
import {
  getEnvironment,
  setAppEnvironment,
  setPackageEnvironment,
} from './localStorage';

describe('Environment', () => {
  const stringEnv = JSON.stringify(envMock);

  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
    fetch.mockResponse(stringEnv);
  });

  it('should fetch and set environment for app', async () => {
    await setAppEnvironment();
    expect(fetch.mock.calls.length).toEqual(1);
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      ORIGIN_ENVIRONMENT,
      stringEnv
    );
    expect(localStorage.__STORE__[ORIGIN_ENVIRONMENT]).toBe(stringEnv);

    await setAppEnvironment();
    expect(fetch.mock.calls.length).toEqual(2);
  });

  it('should fetch and set environment for app with customUrl', async () => {
    const customUrl = '/custom-app-env.json';

    await setAppEnvironment(customUrl);
    expect(fetch).toBeCalledWith(customUrl);
    expect(fetch.mock.calls.length).toEqual(1);

    await setPackageEnvironment(customUrl);
    expect(fetch.mock.calls.length).toEqual(1);
  });

  it('should fetch and set environment for package', async () => {
    await setPackageEnvironment();
    expect(fetch.mock.calls.length).toEqual(1);
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      ORIGIN_ENVIRONMENT,
      stringEnv
    );
    expect(localStorage.__STORE__[ORIGIN_ENVIRONMENT]).toBe(stringEnv);

    await setPackageEnvironment();
    expect(fetch.mock.calls.length).toEqual(1);
  });

  it('should fetch and set environment for package with customUrl', async () => {
    const customUrl = '/custom-package-env.json';

    await setPackageEnvironment(customUrl);
    expect(fetch).toBeCalledWith(customUrl);
    expect(fetch.mock.calls.length).toEqual(1);

    await setPackageEnvironment(customUrl);
    expect(fetch.mock.calls.length).toEqual(1);
  });

  it('should get environment from localStorage', async () => {
    localStorage.setItem(ORIGIN_ENVIRONMENT, stringEnv);

    const valueFromStorage = getEnvironment();

    expect(valueFromStorage.BACKEND_URL).toEqual(envMock.BACKEND_URL);
    expect(valueFromStorage.MARKET_UTC_OFFSET).toEqual(
      envMock.MARKET_UTC_OFFSET
    );
    expect(valueFromStorage.GOOGLE_MAPS_API_KEY).toEqual(
      envMock.GOOGLE_MAPS_API_KEY
    );
  });
});
