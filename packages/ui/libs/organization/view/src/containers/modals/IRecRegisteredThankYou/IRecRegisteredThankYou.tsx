import React, { FC } from 'react';
import { GenericModal } from '@energyweb/origin-ui-core';
import { useIRecRegisteredThankYouEffects } from './IRecRegisteredThankYou.effects';

export const IRecRegisteredThankYou: FC = () => {
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useIRecRegisteredThankYouEffects();
  return (
    <GenericModal
      open={open}
      title={title}
      text={text}
      buttons={buttons}
      dialogProps={dialogProps}
    />
  );
};
