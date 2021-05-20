import { GenericModalProps } from '@energyweb/origin-ui-core';
import { Role } from '@energyweb/origin-backend-core';
import { TFunction } from 'i18next';

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
  ownerName: string;
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
