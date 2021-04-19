import { getDeviceById } from '@energyweb/origin-ui-utils';

// TODO implement test

describe('getDeviceById', function () {
  it('should find device with correct id', function () {
    expect(
      getDeviceById('1', [], {
        BACKEND_PORT: '',
        BACKEND_URL: '',
        BLOCKCHAIN_EXPLORER_URL: '',
        DEFAULT_ENERGY_IN_BASE_UNIT: '',
        DEVICE_PROPERTIES_ENABLED: '',
        EXCHANGE_WALLET_PUB: '',
        GOOGLE_MAPS_API_KEY: '',
        ISSUER_ID: '',
        MARKET_UTC_OFFSET: 0,
        MODE: '',
        REGISTRATION_MESSAGE_TO_SIGN: '',
        WEB3: '',
      })
    ).toMatchInlineSnapshot();
  });
});
