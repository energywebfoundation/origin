import { IUser, OrganizationStatus } from '@energyweb/origin-backend-core';
import { AllFetchOptions, RequireOnlyOne } from '../utils';

type OriginUserOrganization = {
  id: number;
  name: string;
  status: OrganizationStatus;
};

export type OriginUser = Omit<IUser, 'organization'> & {
  organization: OriginUserOrganization;
};

export type FetchUserOptions = RequireOnlyOne<
  AllFetchOptions<OriginUser>,
  'url' | 'fetchFunc'
>;

export type TFetchUser = (options: FetchUserOptions) => Promise<OriginUser>;

export type TFetchAndSetUser = (options: FetchUserOptions) => Promise<void>;

export type TGetOriginUser = () => OriginUser;

export type TRemoveOriginUser = () => void;
