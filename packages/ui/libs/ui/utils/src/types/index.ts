export enum EnergyTypeEnum {
  WIND = 'wind',
  SOLAR = 'solar',
  HYDRO = 'hydro-electric',
  MARINE_TIDAL = 'marine tidal',
  MARINE_WAVE = 'marine wave',
  MARINE_CURRENT = 'marine current',
  MARINE_VERTICAL = 'marine vertical presure',
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

export interface IPermission {
  value: boolean;
  rules: IPermissionRule[];
}

export enum Requirement {
  IsLoggedIn,
  IsActiveUser,
  IsPartOfApprovedOrg,
  HasExchangeDepositAddress,
  HasUserBlockchainAddress,
}

export type RequirementList = Requirement[];
