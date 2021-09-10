import { UserDTO } from '@energyweb/origin-backend-client';
import { OrganizationModalsActionsEnum } from './reducer';

type TChangeMemberRoleState = {
  open: boolean;
  userToUpdate: UserDTO;
  reloadCallback: () => Promise<void>;
};

export interface IOrganizationModalsStore {
  iRecAccountRegistered: boolean;
  iRecConnectOrRegister: boolean;
  iRecRegisteredThankYou: boolean;
  organizationAlreadyExists: boolean;
  registerThankYou: boolean;
  roleChanged: boolean;
  changeMemberOrgRole: TChangeMemberRoleState;
}

interface IShowIRecAccountRegisteredAction {
  type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED;
  payload: boolean;
}

interface IShowIRecConnectOrRegisterAction {
  type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER;
  payload: boolean;
}
interface IShowIRecRegisteredThankYouAction {
  type: OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU;
  payload: boolean;
}
interface IShowOrganizationAlreadyExistsAction {
  type: OrganizationModalsActionsEnum.SHOW_ORGANIZATION_ALREADY_EXISTS;
  payload: boolean;
}
interface IShowRegisterThankYouAction {
  type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU;
  payload: boolean;
}

interface IShowRoleChangeAction {
  type: OrganizationModalsActionsEnum.SHOW_ROLE_CHANGED;
  payload: boolean;
}

interface IChangeMemberOrgRoleAction {
  type: OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE;
  payload: TChangeMemberRoleState;
}

export type TOrganizationModalsAction =
  | IShowIRecAccountRegisteredAction
  | IShowIRecConnectOrRegisterAction
  | IShowIRecRegisteredThankYouAction
  | IShowOrganizationAlreadyExistsAction
  | IShowRegisterThankYouAction
  | IShowRoleChangeAction
  | IChangeMemberOrgRoleAction;
