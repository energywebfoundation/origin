import { useState } from 'react';

export const useTableActionsEffects = () => {
  const [open, setOpen] = useState(false);

  return { open, setOpen };
};
