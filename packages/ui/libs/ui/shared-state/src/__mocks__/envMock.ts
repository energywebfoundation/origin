import { OriginEnvironment } from '../environment';

export const envMock: OriginEnvironment = {
  MODE: 'DEV',
  WEB3: 'https://web3.explorer/',
  BACKEND_URL: 'https://localhost',
  BACKEND_PORT: '3030',
  REGISTRATION_MESSAGE_TO_SIGN: 'I register as test user',
  ISSUER_ID: 'Issuer ID',
  DEVICE_PROPERTIES_ENABLED: 'GRID_OPERATOR,LOCATION',
  DEFAULT_ENERGY_IN_BASE_UNIT: '1',
  EXCHANGE_WALLET_PUB: '0xD11111111111111f',
  GOOGLE_MAPS_API_KEY: 'GOOGLE_API_KEY',
  MARKET_UTC_OFFSET: 0,
  DISABLED_UI_FEATURES: 'DisableUIFeature',
  SMART_METER_ID: 'METER_ID',
};
