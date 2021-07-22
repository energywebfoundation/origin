import { GenericModalProps } from '@energyweb/origin-ui-core';

export type ModalLogicFunctionReturnType = Omit<
  GenericModalProps,
  'open' | 'icon'
>;

export type TRemoveSupplyConfirmLogic = (
  closeModal: () => void,
  submitHandler: () => void
) => ModalLogicFunctionReturnType;
