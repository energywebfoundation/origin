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
  HasIRecOrg,
  HasIRecApiConnection,
  HasActiveOrganization,
}

export interface TUsePermissions {
  hasActiveOrg: boolean;
  hasIRecOrg: boolean;
  iRecConnectionActive: boolean;
  config: Requirement[];
}
