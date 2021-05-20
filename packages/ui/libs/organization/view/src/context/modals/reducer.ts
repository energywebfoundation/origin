export interface IOrganizationModalsStore {
  iRecAccountRegistered: boolean;
  iRecConnectOrRegister: boolean;
  iRecRegisteredThankYou: boolean;
  organizationAlreadyExists: boolean;
  registerThankYou: boolean;
  roleChanged: boolean;
  changeMemberOrgRole: boolean;
}

export enum OrganizationModalsActionsEnum {
  SHOW_IREC_ACCOUNT_REGISTERED = 'SHOW_IREC_ACCOUNT_REGISTERED',
  SHOW_IREC_CONNECT_OR_REGISTER = 'SHOW_IREC_CONNECT_OR_REGISTER',
  SHOW_IREC_REGISTERED_THANK_YOU = 'SHOW_IREC_REGISTERED_THANK_YOU',
  SHOW_ORGANIZATION_ALREADY_EXISTS = 'SHOW_ORGANIZATION_ALREADY_EXISTS',
  SHOW_REGISTER_THANK_YOU = 'SHOW_REGISTER_THANK_YOU',
  SHOW_ROLE_CHANGED = 'SHOW_ROLE_CHANGED',
  SHOW_CHANGE_MEMBER_ORG_ROLE = 'SHOW_CHANGE_MEMBER_ORG_ROLE',
}

export type TOrganizationModalsAction = {
  type: OrganizationModalsActionsEnum;
  payload: boolean;
};

export const orgModalsInitialState: IOrganizationModalsStore = {
  iRecAccountRegistered: false,
  iRecConnectOrRegister: false,
  iRecRegisteredThankYou: false,
  organizationAlreadyExists: false,
  registerThankYou: false,
  roleChanged: false,
  changeMemberOrgRole: false,
};

export const orgModalsReducer = (
  state: IOrganizationModalsStore,
  { type, payload }: TOrganizationModalsAction
): IOrganizationModalsStore => {
  switch (type) {
    case OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED:
      return { ...state, iRecAccountRegistered: payload };

    case OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER:
      return { ...state, iRecConnectOrRegister: payload };

    case OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU:
      return { ...state, iRecRegisteredThankYou: payload };

    case OrganizationModalsActionsEnum.SHOW_ORGANIZATION_ALREADY_EXISTS:
      return { ...state, organizationAlreadyExists: payload };

    case OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU:
      return { ...state, registerThankYou: payload };

    case OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED:
      return { ...state, roleChanged: payload };

    case OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE:
      return { ...state, changeMemberOrgRole: payload };
  }
};
