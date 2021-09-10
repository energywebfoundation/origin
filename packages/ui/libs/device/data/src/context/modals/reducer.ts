import { IOrganizationModalsStore, TOrganizationModalsAction } from './types';

export enum OrganizationModalsActionsEnum {
  SHOW_IREC_ACCOUNT_REGISTERED = 'SHOW_IREC_ACCOUNT_REGISTERED',
  SHOW_IREC_CONNECT_OR_REGISTER = 'SHOW_IREC_CONNECT_OR_REGISTER',
  SHOW_IREC_REGISTERED_THANK_YOU = 'SHOW_IREC_REGISTERED_THANK_YOU',
  SHOW_ORGANIZATION_ALREADY_EXISTS = 'SHOW_ORGANIZATION_ALREADY_EXISTS',
  SHOW_REGISTER_THANK_YOU = 'SHOW_REGISTER_THANK_YOU',
  SHOW_ROLE_CHANGED = 'SHOW_ROLE_CHANGED',
  SHOW_CHANGE_MEMBER_ORG_ROLE = 'SHOW_CHANGE_MEMBER_ORG_ROLE',
}

export const orgModalsInitialState: IOrganizationModalsStore = {
  iRecAccountRegistered: false,
  iRecConnectOrRegister: false,
  iRecRegisteredThankYou: false,
  organizationAlreadyExists: false,
  registerThankYou: false,
  roleChanged: false,
  changeMemberOrgRole: {
    open: false,
    userToUpdate: null,
    reloadCallback: null,
  },
};

export const orgModalsReducer = (
  state = orgModalsInitialState,
  action: TOrganizationModalsAction
): IOrganizationModalsStore => {
  switch (action.type) {
    case OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED:
      return { ...state, iRecAccountRegistered: action.payload };

    case OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER:
      return { ...state, iRecConnectOrRegister: action.payload };

    case OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU:
      return { ...state, iRecRegisteredThankYou: action.payload };

    case OrganizationModalsActionsEnum.SHOW_ORGANIZATION_ALREADY_EXISTS:
      return { ...state, organizationAlreadyExists: action.payload };

    case OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU:
      return { ...state, registerThankYou: action.payload };

    case OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED:
      return { ...state, roleChanged: action.payload };

    case OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE:
      return { ...state, changeMemberOrgRole: { ...action.payload } };
  }
};
