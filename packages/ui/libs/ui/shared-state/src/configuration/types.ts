import { IOriginConfiguration } from '@energyweb/origin-backend-core';
import { AllFetchOptions, OriginResponse, RequireOnlyOne } from '../utils';

export type OriginConfiguration = IOriginConfiguration;

export type FetchConfigurationOptions = RequireOnlyOne<
  AllFetchOptions<OriginConfiguration>,
  'url' | 'fetchFunc'
>;

export type TConfigurationResponse = OriginResponse<OriginConfiguration>;

export type TFetchConfiguration = (
  options: FetchConfigurationOptions
) => Promise<OriginConfiguration>;

export type TGetConfiguration = () => OriginConfiguration;

export type TFetchAndSetConfiguration = (
  options: FetchConfigurationOptions
) => Promise<void>;

export type TRemoveConfiguration = () => void;
