import React from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { useConfirmImportModalEffects } from './ConfirmImportModal.effects';

export const ConfirmImportModal = () => {
  const modalProps = useConfirmImportModalEffects();
  return <GenericModal {...modalProps} />;
};
