import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { OrganizationAdded } from '@energyweb/origin-ui-assets';
import { useIRecConnectOrRegisterEffects } from './IRecConnectOrRegister.effects';

export const IRecConnectOrRegisterModal: FC = () => {
  const { open, title, text, buttons } = useIRecConnectOrRegisterEffects();
  return (
    <GenericModal
      icon={<OrganizationAdded />}
      open={open}
      title={title}
      text={text}
      buttons={buttons}
    />
  );
};
