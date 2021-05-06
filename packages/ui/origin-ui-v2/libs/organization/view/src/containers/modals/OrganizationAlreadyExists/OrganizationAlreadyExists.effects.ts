import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useOrganizationAlreadyExistsLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useOrganizationAlreadyExistsEffects = () => {
  const [open, setOpen] = useState(true);

  const { title, text, buttons } = useOrganizationAlreadyExistsLogic(setOpen);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
