export enum GeneralActions {
    showAccountChangedModal = 'SHOW_ACCOUNT_CHANGED_MODAL',
    hideAccountChangedModal = 'HIDE_ACCOUNT_CHANGED_MODAL',
    disableAccountChangedModal = 'DISABLE_ACCOUNT_CHANGED_MODAL',
    setLoading = 'GENERAL_SET_LOADING',
    setError = 'GENERAL_SET_ERROR'
}

export interface TShowAccountChangedModalAction {
    type: GeneralActions.showAccountChangedModal;
}

export type TShowAccountChangedModal = typeof showAccountChangedModal;

export const showAccountChangedModal = () => ({
    type: GeneralActions.showAccountChangedModal
});

export interface THideAccountChangedModalAction {
    type: GeneralActions.hideAccountChangedModal;
}

export type THideAccountChangedModal = typeof hideAccountChangedModal;

export const hideAccountChangedModal = () => ({
    type: GeneralActions.hideAccountChangedModal
});

export interface TDisableAccountChangedModalAction {
    type: GeneralActions.disableAccountChangedModal;
}

export type TDisableAccountChangedModal = typeof disableAccountChangedModal;

export const disableAccountChangedModal = () => ({
    type: GeneralActions.disableAccountChangedModal
});

export interface TSetLoadingAction {
    type: GeneralActions.setLoading;
    payload: boolean;
}

export type TSetLoading = typeof setLoading;

export const setLoading = (
    payload: TSetLoadingAction['payload']
) => ({
    type: GeneralActions.setLoading,
    payload
});

export interface TSetErrorAction {
    type: GeneralActions.setError;
    payload: string;
}

export type TSetError = typeof setError;

export const setError = (
    payload: TSetErrorAction['payload']
) => ({
    type: GeneralActions.setError,
    payload
});

export type IGeneralAction = TShowAccountChangedModalAction | THideAccountChangedModalAction |
    TDisableAccountChangedModalAction | TSetLoadingAction | TSetErrorAction;