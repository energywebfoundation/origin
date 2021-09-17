import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { prepareRegionsOptions } from '../utils';

type TUseRegionsFilterLogic = (
  value: FormSelectOption[],
  onChange: (...event: any[]) => void,
  allRegions: ConfigurationDTORegions
) => SelectAutocompleteProps;

export const useRegionsFilterLogic: TUseRegionsFilterLogic = (
  value,
  onChange,
  allRegions
) => {
  const { t } = useTranslation();

  return {
    value,
    onChange,
    field: {
      name: 'regions',
      label: t('exchange.viewMarket.regions'),
      options: prepareRegionsOptions(allRegions),
      multiple: true,
    },
    errorExists: false,
    errorText: '',
    variant: 'filled',
  };
};
