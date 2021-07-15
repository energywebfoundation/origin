import { IUserModalsStore, TUserModalsAction } from './types';

export enum UserModalsActionsEnum {
  SHOW_USER_REGISTERED = 'SHOW_USER_REGISTERED',
  SHOW_LOGIN_REGISTER_ORG = 'SHOW_LOGIN_REGISTER_ORG',
  SHOW_PENDING_INVITATION = 'SHOW_PENDING_INVITATION',
  SHOW_CREATE_EXCHANGE_ADDRESS = 'SHOW_CREATE_EXCHANGE_ADDRESS',
}

export const userModalsInitialState: IUserModalsStore = {
  userRegistered: false,
  loginRegisterOrg: false,
  pendingInvitation: {
    open: false,
    invitation: null,
  },
  createExchangeAddress: false,
};

export const userModalsReducer = (
  state = userModalsInitialState,
  action: TUserModalsAction
): IUserModalsStore => {
  switch (action.type) {
    case UserModalsActionsEnum.SHOW_USER_REGISTERED:
      return { ...state, userRegistered: action.payload };
    case UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG:
      return { ...state, loginRegisterOrg: action.payload };
    case UserModalsActionsEnum.SHOW_PENDING_INVITATION:
      return { ...state, pendingInvitation: action.payload };
    case UserModalsActionsEnum.SHOW_CREATE_EXCHANGE_ADDRESS:
      return { ...state, createExchangeAddress: action.payload };
  }
};
