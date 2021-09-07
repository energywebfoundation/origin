import {
  GenericModalProps,
  SelectRegularProps,
} from '@energyweb/origin-ui-core';
import { Role } from '@energyweb/origin-backend-core';
import { TFunction } from 'i18next';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

type ModalLogicFunctionReturnType = Omit<GenericModalProps, 'open' | 'icon'>;

export type TIRecConnectOrRegisterLogic = (
  notNow: () => void,
  register: () => void
) => ModalLogicFunctionReturnType;

export type TRegisterThankYouLogic = (
  closeModal: () => void
) => ModalLogicFunctionReturnType;

export type TOrganizationAlreadyExistsLogic = (
  closeModal: () => void
) => ModalLogicFunctionReturnType;

export type TIRecAccountRegisteredLogic = (
  closeModal: () => void
) => ModalLogicFunctionReturnType;

export type TIRecRegisteredThankYouLogic = (
  closeModal: () => void
) => ModalLogicFunctionReturnType;

type RoleChangeLogicArgs = {
  t: TFunction;
  closeModal: () => void;
  role: Role;
  orgName: string;
  isIRecEnabled: boolean;
};

export type RoleDescription = {
  title: string;
  actions: string[];
};

export type TRoleChangedLogic = (
  args: RoleChangeLogicArgs
) => Omit<GenericModalProps, 'open' | 'icon' | 'text'> & {
  subtitle: string;
  roleDescriptions: RoleDescription[];
};

type TChangeMemberRoleArgs = {
  userToUpdate: UserDTO;
  closeModal: () => void;
  changeRoleHandler: () => void;
  buttonDisabled: boolean;
};
export type TChangeMemberRoleLogic = (
  props: TChangeMemberRoleArgs
) => ModalLogicFunctionReturnType &
  Omit<SelectRegularProps, 'value' | 'onChange'>;
