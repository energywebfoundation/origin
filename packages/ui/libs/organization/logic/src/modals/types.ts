import { GenericModalProps } from '@energyweb/origin-ui-core';
import { Role } from '@energyweb/origin-backend-core';

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
  setOpen: (value: boolean) => void;
  role: Role;
  orgName: string;
  iRecPlatform: boolean;
};

type RoleDescription = {
  title: string;
  rights: string[];
};

export type TRoleChangedLogic = (
  args: RoleChangeLogicArgs
) => Omit<GenericModalProps, 'open' | 'icon' | 'text'> & {
  roleDescriptions: RoleDescription[];
};
