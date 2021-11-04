import { useState } from 'react';

export const useListActionsBlockEffects = (
  selectedTab?: number,
  setSelectedTab?: (value: number) => void
) => {
  const [tabIndex, setTabIndex] = useState(0);

  const selected = !isNaN(selectedTab) ? selectedTab : tabIndex;
  const setSelected = setSelectedTab ? setSelectedTab : setTabIndex;

  return { selected, setSelected };
};
