import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export enum EnergyTypeEnum {
  WIND = 'wind',
  SOLAR = 'solar',
  HYDRO = 'hydro-electric',
  MARINE_TIDAL = 'marine tidal',
  MARINE_WAVE = 'marine wave',
  MARINE_CURRENT = 'marine current',
  MARINE_VERTICAL = 'marine vertical pressure',
  RENEWABLE_HEAT = 'renewable heat',
  BIOMASS_SOLID = 'biomass solid',
  BIOMASS_LIQUID = 'biomass liquid',
  BIOGAS = 'biogas',
  CO_FIRED_WITH_FOSSIL = 'co-fired with fossil',
}

export interface IPermissionRule {
  label: string;
  passing: boolean;
}

export interface TUsePermissions {
  user: UserDTO;
  exchangeDepositAddress: string;
  loading: boolean;
  config?: Requirement[];
}

export interface IPermissionReturnType {
  canAccessPage: boolean;
  loading: boolean;
  accessRules: IPermissionRule[];
  title: string;
}

export enum Requirement {
  IsLoggedIn,
  IsActiveUser,
  IsPartOfApprovedOrg,
  HasExchangeDepositAddress,
  HasOrganizationBlockchainAddress,
}

export type RequirementList = Requirement[];
