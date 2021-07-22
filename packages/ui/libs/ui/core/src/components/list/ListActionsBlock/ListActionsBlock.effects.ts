import { useState } from 'react';

export const useListActionsBlockEffects = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return { tabIndex, setTabIndex };
};
