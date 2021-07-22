import { hierarchyDivider } from '@energyweb/origin-ui-utils';
import { difference } from 'lodash';

export const useHierarchicalSelectEffects = () => {
  const inputDisplayer = (value: string, index: number) => {
    const activeLevel = value ? value.split(hierarchyDivider).length : 0;
    return index <= activeLevel;
  };

  const getRelevantOptions = (value: string, options: string[][]) => {
    if (!value) {
      return options;
    }
    const valueArr = value.split(hierarchyDivider);
    return options.filter(
      (optionArr) =>
        options[0].length - valueArr.length === 1 &&
        difference(optionArr, valueArr).length === 1
    );
  };

  const getLevelValue = (value: string, index: number) => {
    const valueAsArr = value.split(hierarchyDivider);
    return valueAsArr.slice(0, index).join(hierarchyDivider);
  };

  return { inputDisplayer, getRelevantOptions, getLevelValue };
};
