import { GenericModalProps } from '@energyweb/origin-ui-core';
import { registerThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useRegisterThankYouEffects = () => {
  const [open, setOpen] = useState(true);

  const { title, text, buttons } = registerThankYouLogic();

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
