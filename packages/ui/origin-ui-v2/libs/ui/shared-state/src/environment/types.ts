import { OriginResponse } from '../utils';

export type OriginEnvironment = {
  MODE: string;
  BACKEND_URL: string;
  BACKEND_PORT: string;
  WEB3: string;
  REGISTRATION_MESSAGE_TO_SIGN: string;
  ISSUER_ID: string;
  DEVICE_PROPERTIES_ENABLED: string;
  DEFAULT_ENERGY_IN_BASE_UNIT: string;
  EXCHANGE_WALLET_PUB: string;
  GOOGLE_MAPS_API_KEY: string;
  MARKET_UTC_OFFSET: number;
  DISABLED_UI_FEATURES: string;
  SMART_METER_ID: string;
};

export type ResponseEnvironment = Omit<
  OriginEnvironment,
  'MARKET_UTC_OFFSET'
> & {
  MARKET_UTC_OFFSET: string;
};

export type TEnvironmentResponse = OriginResponse<ResponseEnvironment>;

export type TFetchEnvironment = (
  customUrl?: string
) => Promise<OriginEnvironment>;

export type TGetEnvironment = () => OriginEnvironment;

export type TFetchAndSetEnvironment = (configUrl?: string) => Promise<void>;

export type TRemoveEnvironment = () => void;
