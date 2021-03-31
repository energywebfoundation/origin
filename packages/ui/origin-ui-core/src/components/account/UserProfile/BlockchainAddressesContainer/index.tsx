import React, { ReactElement } from 'react';
import { useBlockchainAddressesEffects } from './hooks/useBlockchainAddressesEffects';
import { BlockchainAddressesForm } from '../BlockchainAddressesForm';
import { useBlockchainAdressFormValidationHandler } from './hooks/useBlockchainAdressFormValidationHandler';

export const BlockchainAddressesContainer = (): ReactElement => {
    const {
        exchangeAddress,
        isLoading,
        formData,
        updateBlockchainAccount,
        user,
        createExchangeAddress
    } = useBlockchainAddressesEffects();
    const validationHandler = useBlockchainAdressFormValidationHandler();
    return (
        <BlockchainAddressesForm
            handleValidation={validationHandler}
            exchangeAddress={exchangeAddress}
            user={user}
            formData={formData}
            onCreateExchangeAddress={createExchangeAddress}
            isLoading={isLoading}
            onUpdateBlockchainAccount={() => updateBlockchainAccount()}
        />
    );
};
