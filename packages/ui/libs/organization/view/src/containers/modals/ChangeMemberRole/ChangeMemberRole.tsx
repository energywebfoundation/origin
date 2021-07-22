import { GenericModal, SelectRegular } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { useChangeMemberRoleEffects } from './ChangeMemberRole.effects';

export const ChangeMemberRole: FC = () => {
  const { modalProps, selectProps } = useChangeMemberRoleEffects();

  return (
    <GenericModal
      customContent={<SelectRegular {...selectProps} />}
      {...modalProps}
    />
  );
};
