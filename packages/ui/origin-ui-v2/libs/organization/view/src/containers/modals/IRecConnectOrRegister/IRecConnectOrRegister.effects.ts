import { iRecConnectOrRegisterLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useIRecConnectOrRegisterEffects = () => {
  const [open, setOpen] = useState(false);

  const { title, text, buttons } = iRecConnectOrRegisterLogic(setOpen);

  return { open, title, text, buttons };
};
