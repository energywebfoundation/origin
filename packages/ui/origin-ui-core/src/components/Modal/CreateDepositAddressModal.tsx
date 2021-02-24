import React from 'react';
import { GenericGoToUserSettingModal } from './GenericGoToUserSettingModal';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
}

export const CreateDepositAddressModal = ({ showModal, setShowModal }: IProps) => {
    return (
        <GenericGoToUserSettingModal
            showModal={showModal}
            setShowModal={setShowModal}
            title={'general.info.createExchangeDepositAddressTitle'}
            content={'general.info.createExchangeDepositAddressContent'}
            button={'general.actions.createDepositAddress'}
        />
    );
};
