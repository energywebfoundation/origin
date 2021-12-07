import { useState } from 'react';

export const useListActionsBlockEffects = (
  selectedTab?: number,
  setSelectedTab?: (value: number) => void,
  resetSelected?: () => void
) => {
  const [tabIndex, setTabIndex] = useState(0);

  const selected = !isNaN(selectedTab) ? selectedTab : tabIndex;
  const setSelected = setSelectedTab ? setSelectedTab : setTabIndex;
  const resetList = () => {
    resetSelected();
    setSelected(0);
  };

  return { selected, setSelected, resetList };
};
