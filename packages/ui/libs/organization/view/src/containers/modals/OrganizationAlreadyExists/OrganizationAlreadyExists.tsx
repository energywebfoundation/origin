import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { OrganizationAdded } from '@energyweb/origin-ui-assets';
import { useOrganizationAlreadyExistsEffects } from './OrganizationAlreadyExists.effects';

export const OrganizationAlreadyExists: FC = () => {
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useOrganizationAlreadyExistsEffects();

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
