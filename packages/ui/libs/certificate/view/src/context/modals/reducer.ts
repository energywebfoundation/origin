import { ICertificateModalsStore, TCertificateModalsAction } from './types';

export enum CertificateModalsActionsEnum {
  SHOW_CONFIRM_IMPORT = 'SHOW_CONFIRM_IMPORT',
}

export const CertificateModalsInitialState: ICertificateModalsStore = {
  confirmImport: {
    open: false,
    certificate: null,
  },
};

export const CertificateModalsReducer = (
  state = CertificateModalsInitialState,
  action: TCertificateModalsAction
): ICertificateModalsStore => {
  switch (action.type) {
    case CertificateModalsActionsEnum.SHOW_CONFIRM_IMPORT:
      return { ...state, confirmImport: action.payload };
  }
};
