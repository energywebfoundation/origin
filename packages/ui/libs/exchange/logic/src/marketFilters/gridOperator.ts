import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { gridOperatorOptions } from '../utils';

type TUseGridOperatorFilterLogic = (
  value: FormSelectOption[],
  onChange: (...event: any[]) => void
) => SelectAutocompleteProps;

export const useGridOperatorFilterLogic: TUseGridOperatorFilterLogic = (
  value,
  onChange
) => {
  return {
    value,
    onChange,
    field: {
      name: 'gridOperator',
      label: 'Grid Operator',
      options: gridOperatorOptions,
    },
    errorExists: false,
    errorText: '',
    variant: 'filled',
  };
};
