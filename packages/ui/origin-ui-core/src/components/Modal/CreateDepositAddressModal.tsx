import React from 'react';
import { GenericGoToUserSettingModal } from './GenericGoToUserSettingModal';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
}

export const ConnectBlockchainAccountModal = ({ showModal, setShowModal }: IProps) => {
    return (
        <GenericGoToUserSettingModal
            showModal={showModal}
            setShowModal={setShowModal}
            title={'general.info.connectBlockchainTitle'}
            content={'general.info.connectBlockchainContent'}
            button={'general.actions.maybeLater'}
        />
    );
};
