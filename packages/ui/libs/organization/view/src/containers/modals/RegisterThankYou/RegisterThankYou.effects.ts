import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useRegisterThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useRegisterThankYouEffects = () => {
  const [open, setOpen] = useState(true);

  const { title, text, buttons } = useRegisterThankYouLogic();

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
