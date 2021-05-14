import { useState } from 'react';

export const useDesktopNavEffects = (defaultOpenSection: string = null) => {
  const [openSection, setOpenSection] = useState<string>(defaultOpenSection);
  return { openSection, setOpenSection };
};
