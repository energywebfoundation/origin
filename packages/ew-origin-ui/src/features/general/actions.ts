export enum GeneralActions {
    showAccountChangedModal = 'SHOW_ACCOUNT_CHANGED_MODAL',
    hideAccountChangedModal = 'HIDE_ACCOUNT_CHANGED_MODAL',
    disableAccountChangedModal = 'DISABLE_ACCOUNT_CHANGED_MODAL'
}

export type TShowAccountChangedModal = typeof showAccountChangedModal; 

export const showAccountChangedModal = () => ({
    type: GeneralActions.showAccountChangedModal
});

export type THideAccountChangedModal = typeof hideAccountChangedModal; 

export const hideAccountChangedModal = () => ({
    type: GeneralActions.hideAccountChangedModal
});

export type TDisableAccountChangedModal = typeof disableAccountChangedModal; 

export const disableAccountChangedModal = () => ({
    type: GeneralActions.disableAccountChangedModal
});