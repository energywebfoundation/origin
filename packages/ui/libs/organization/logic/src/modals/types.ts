import { GenericModalProps } from '@energyweb/origin-ui-core';
import { Role } from '@energyweb/origin-backend-core';
import { TFunction } from 'i18next';

type ModalLogicFunctionReturnType = Omit<GenericModalProps, 'open' | 'icon'>;

export type TIRecConnectOrRegisterLogic = (
  setOpen: (value: boolean) => void
) => ModalLogicFunctionReturnType;

export type TRegisterThankYouLogic = () => ModalLogicFunctionReturnType;

export type TOrganizationAlreadyExistsLogic = (
  setOpen: (value: boolean) => void
) => ModalLogicFunctionReturnType;

export type TIRecAccountRegisteredLogic = () => ModalLogicFunctionReturnType;

export type TIRecRegisteredThankYouLogic = () => ModalLogicFunctionReturnType;

type RoleChangeLogicArgs = {
  t: TFunction;
  setOpen: (value: boolean) => void;
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
