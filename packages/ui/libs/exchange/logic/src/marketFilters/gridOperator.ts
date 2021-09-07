import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { gridOperatorOptions } from '../utils';

type TUseGridOperatorFilterLogic = (
  value: FormSelectOption[],
  onChange: (...event: any[]) => void
) => SelectAutocompleteProps;

export const useGridOperatorFilterLogic: TUseGridOperatorFilterLogic = (
  value,
  onChange
) => {
  const { t } = useTranslation();
  return {
    value,
    onChange,
    field: {
      name: 'gridOperator',
      label: t('exchange.viewMarket.gridOperator'),
      options: gridOperatorOptions,
    },
    errorExists: false,
    errorText: '',
    variant: 'filled',
  };
};
