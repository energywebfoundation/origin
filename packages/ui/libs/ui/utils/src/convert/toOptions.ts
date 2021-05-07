type Option = {
  value: string;
  label: string;
};

export const hierarchyDivider = ' - ';

export const convertLevelToSelectOptions = (level: string[][]): Option[] => {
  return level.map((item) => ({
    value: item.join(hierarchyDivider),
    label: item.join(hierarchyDivider),
  }));
};
