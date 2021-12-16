import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import {
  RegistrationDTO,
  ShortConnectionDTO,
} from '@energyweb/origin-organization-irec-api-react-query-client';

export interface IPermissionRule {
  label: string;
  passing: boolean;
}

export interface IPermissionReturnType {
  canAccessPage: boolean;
  requirementsProps: {
    rules: IPermissionRule[];
    title: string;
  };
}

export enum Requirement {
  IsLoggedIn,
  IsActiveUser,
  IsPartOfApprovedOrg,
  HasExchangeDepositAddress,
  HasOrganizationBlockchainAddress,
  HasIRecOrg,
  HasIRecApiConnection,
}

export type RequirementList = Requirement[];

export interface TUsePermissions {
  user: UserDTO;
  exchangeDepositAddress: string;
  iRecOrg?: RegistrationDTO;
  iRecConnection?: ShortConnectionDTO;
  config?: RequirementList;
}
