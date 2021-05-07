import { useState } from 'react';

export const useMainLayoutEffects = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return { mobileNavOpen, setMobileNavOpen };
};
