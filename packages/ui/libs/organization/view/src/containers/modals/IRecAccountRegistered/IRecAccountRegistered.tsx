import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { OrganizationAdded } from '@energyweb/origin-ui-assets';
import { useIRecAccountRegisteredEffects } from './IRecAccountRegistered.effects';

export const IRecAccountRegistered: FC = () => {
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useIRecAccountRegisteredEffects();
  return (
    <GenericModal
      icon={<OrganizationAdded />}
      open={open}
      title={title}
      text={text}
      buttons={buttons}
      dialogProps={dialogProps}
    />
  );
};
