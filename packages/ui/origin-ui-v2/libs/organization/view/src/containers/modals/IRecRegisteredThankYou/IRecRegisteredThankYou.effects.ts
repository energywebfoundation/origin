import { GenericModalProps } from '@energyweb/origin-ui-core';
import { IRecRegisteredThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useIRecRegisteredThankYouEffects = () => {
  const [open, setOpen] = useState(false);

  const { title, text, buttons } = IRecRegisteredThankYouLogic();

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
