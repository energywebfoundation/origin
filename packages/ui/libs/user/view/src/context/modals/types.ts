import { UserModalsActionsEnum } from './reducer';

export interface IUserModalsStore {
  userRegistered: boolean;
}

interface IShowUserRegisteredAction {
  type: UserModalsActionsEnum.SHOW_USER_REGISTERED;
  payload: boolean;
}

export type TUserModalsAction = IShowUserRegisteredAction;
