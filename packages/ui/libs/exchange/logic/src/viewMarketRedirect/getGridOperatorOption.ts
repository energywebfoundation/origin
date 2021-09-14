import { gridOperatorOptions } from '../utils';

export const getGridOperatorOptions = (gridOperators: string[]) => {
  return gridOperatorOptions.filter((option) =>
    gridOperators.includes(option.value as string)
  );
};
