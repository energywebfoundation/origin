import { GenericModalProps } from '@energyweb/origin-ui-core';
import { organizationAlreadyExistsLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useOrganizationAlreadyExistsEffects = () => {
  const [open, setOpen] = useState(true);

  const { title, text, buttons } = organizationAlreadyExistsLogic(setOpen);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
