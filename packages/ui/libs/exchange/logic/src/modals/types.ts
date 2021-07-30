import { GenericModalProps } from '@energyweb/origin-ui-core';

export type ModalLogicFunctionReturnType = Omit<
  GenericModalProps,
  'open' | 'icon'
>;

export type TRemoveConfirmModalLogic = (
  closeModal: () => void,
  submitHandler: () => void
) => ModalLogicFunctionReturnType;
