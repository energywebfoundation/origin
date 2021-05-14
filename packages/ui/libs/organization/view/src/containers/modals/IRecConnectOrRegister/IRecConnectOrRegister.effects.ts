import { useIRecConnectOrRegisterLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useIRecConnectOrRegisterEffects = () => {
  const [open, setOpen] = useState(false);

  const { title, text, buttons } = useIRecConnectOrRegisterLogic(setOpen);

  return { open, title, text, buttons };
};
