import { useState } from 'react';

export const useDesktopNavEffects = (defaultOpenSection: string) => {
  const [openSection, setOpenSection] = useState<string>(defaultOpenSection);

  return { openSection, setOpenSection };
};
