import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { prepareSubRegionsOptions } from '../utils';

type TUseSubRegionsFilterLogic = (
  value: FormSelectOption[],
  onChange: (...event: any[]) => void,
  country: string,
  allRegions: ConfigurationDTORegions,
  selectedRegions: FormSelectOption[]
) => SelectAutocompleteProps;

export const useSubRegionsFilterLogic: TUseSubRegionsFilterLogic = (
  value,
  onChange,
  country,
  allRegions,
  selectedRegions
) => {
  const { t } = useTranslation();

  return {
    value,
    onChange,
    field: {
      name: 'subregions',
      label: t('exchange.viewMarket.subregions'),
      multiple: true,
      options: prepareSubRegionsOptions(allRegions, country, selectedRegions),
    },
    errorExists: false,
    errorText: '',
    variant: 'filled',
  };
};
