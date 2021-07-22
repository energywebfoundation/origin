import fetch from 'jest-fetch-mock';
import { ORIGIN_CONFIGURATION } from '../utils/constants';
import { configMock } from '../__mocks__/configMock';
import {
  getConfiguration,
  setAppConfiguration,
  setPackageConfiguration,
} from './localStorage';

describe('Configuration', () => {
  const stringConfig = JSON.stringify(configMock);

  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
    fetch.mockResponse(stringConfig);
  });

  it('should fetch and set configuration for app', async () => {
    await setAppConfiguration({ url: '/config' });
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch).toBeCalledWith('/config');
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      ORIGIN_CONFIGURATION,
      stringConfig
    );
    expect(localStorage.__STORE__[ORIGIN_CONFIGURATION]).toBe(stringConfig);

    await setAppConfiguration({ url: '/config' });
    expect(fetch.mock.calls.length).toEqual(2);
  });

  it('should fetch and set configuration for package', async () => {
    await setPackageConfiguration({ url: '/config' });
    expect(fetch.mock.calls.length).toEqual(1);
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      ORIGIN_CONFIGURATION,
      stringConfig
    );
    expect(localStorage.__STORE__[ORIGIN_CONFIGURATION]).toBe(stringConfig);

    await setPackageConfiguration({ url: '/config' });
    expect(fetch.mock.calls.length).toEqual(1);
  });

  it('should get configuration from localStorage', async () => {
    localStorage.setItem(ORIGIN_CONFIGURATION, stringConfig);

    const valueFromStorage = getConfiguration();

    expect(valueFromStorage.countryName).toEqual(configMock.countryName);
    expect(valueFromStorage.complianceStandard).toEqual(
      configMock.complianceStandard
    );
    expect(valueFromStorage.currencies[0]).toEqual(configMock.currencies[0]);
  });
});
