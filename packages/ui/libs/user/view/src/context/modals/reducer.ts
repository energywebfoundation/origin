import { IUserModalsStore, TUserModalsAction } from './types';

export enum UserModalsActionsEnum {
  SHOW_USER_REGISTERED = 'SHOW_USER_REGISTERED',
}

export const userModalsInitialState: IUserModalsStore = {
  userRegistered: false,
};

export const userModalsReducer = (
  state = userModalsInitialState,
  action: TUserModalsAction
): IUserModalsStore => {
  switch (action.type) {
    case UserModalsActionsEnum.SHOW_USER_REGISTERED:
      return { ...state, userRegistered: action.payload };
  }
};
