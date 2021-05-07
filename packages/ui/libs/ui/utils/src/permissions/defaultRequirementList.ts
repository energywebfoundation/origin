import { Requirement, RequirementList } from './../types';

export const defaultRequirementList: RequirementList = [
  Requirement.IsLoggedIn,
  Requirement.IsActiveUser,
  Requirement.IsPartOfApprovedOrg,
  Requirement.HasExchangeDepositAddress,
];
