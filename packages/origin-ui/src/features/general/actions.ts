export enum GeneralActions {
    showAccountChangedModal = 'SHOW_ACCOUNT_CHANGED_MODAL',
    hideAccountChangedModal = 'HIDE_ACCOUNT_CHANGED_MODAL',
    disableAccountChangedModal = 'DISABLE_ACCOUNT_CHANGED_MODAL',
    setLoading = 'GENERAL_SET_LOADING',
    setError = 'GENERAL_SET_ERROR'
}

export interface IShowAccountChangedModalAction {
    type: GeneralActions.showAccountChangedModal;
}

export const showAccountChangedModal = () => ({
    type: GeneralActions.showAccountChangedModal
});

export type TShowAccountChangedModal = typeof showAccountChangedModal;

export interface IHideAccountChangedModalAction {
    type: GeneralActions.hideAccountChangedModal;
}

export const hideAccountChangedModal = () => ({
    type: GeneralActions.hideAccountChangedModal
});

export type THideAccountChangedModal = typeof hideAccountChangedModal;

export interface IDisableAccountChangedModalAction {
    type: GeneralActions.disableAccountChangedModal;
}

export const disableAccountChangedModal = () => ({
    type: GeneralActions.disableAccountChangedModal
});

export type TDisableAccountChangedModal = typeof disableAccountChangedModal;

export interface ISetLoadingAction {
    type: GeneralActions.setLoading;
    payload: boolean;
}

export const setLoading = (payload: ISetLoadingAction['payload']) => ({
    type: GeneralActions.setLoading,
    payload
});

export type TSetLoading = typeof setLoading;

export interface ISetErrorAction {
    type: GeneralActions.setError;
    payload: string;
}

export const setError = (payload: ISetErrorAction['payload']) => ({
    type: GeneralActions.setError,
    payload
});

export type TSetError = typeof setError;

export type IGeneralAction =
    | IShowAccountChangedModalAction
    | IHideAccountChangedModalAction
    | IDisableAccountChangedModalAction
    | ISetLoadingAction
    | ISetErrorAction;
