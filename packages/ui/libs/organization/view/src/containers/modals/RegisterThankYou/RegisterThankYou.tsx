import { GenericModal } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { useRegisterThankYouEffects } from './RegisterThankYou.effects';

export const RegisterThankYou: FC = () => {
  const {
    open,
    title,
    text,
    buttons,
    dialogProps,
  } = useRegisterThankYouEffects();

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
