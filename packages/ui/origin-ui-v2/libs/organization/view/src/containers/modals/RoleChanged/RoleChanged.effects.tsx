// import { roleChangedLogic } from '@energyweb/origin-ui-organization-logic';
import { useState } from 'react';

export const useRoleChangedEffects = () => {
  const [open, setOpen] = useState(false);

  // @should change this mock to actual role
  // const { title, buttons } = roleChangedLogic({ setOpen,  });

  return { open };
};
