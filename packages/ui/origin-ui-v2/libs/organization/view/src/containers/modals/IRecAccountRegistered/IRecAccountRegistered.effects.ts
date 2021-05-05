import { GenericModalProps } from '@energyweb/origin-ui-core';
import { iRecAccountRegisteredLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useIRecAccountRegisteredEffects = () => {
  const [open, setOpen] = useState(false);

  const { title, text, buttons } = iRecAccountRegisteredLogic();

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
