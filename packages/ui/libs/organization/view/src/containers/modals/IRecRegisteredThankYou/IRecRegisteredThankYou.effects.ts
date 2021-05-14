import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useIRecRegisteredThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useIRecRegisteredThankYouEffects = () => {
  const [open, setOpen] = useState(false);

  const { title, text, buttons } = useIRecRegisteredThankYouLogic();

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
