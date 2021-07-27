import { ConfigurationDTORegions } from '@energyweb/origin-backend-react-query-client';
import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

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

  const regionsOptions: FormSelectOption[] = allRegions
    ? Object.keys(allRegions).map((region) => ({
        value: region,
        label: region,
      }))
    : [];

  return {
    value,
    onChange,
    field: {
      name: 'regions',
      label: t('exchange.viewMarket.regions'),
      options: regionsOptions,
      multiple: true,
    },
    errorExists: false,
    errorText: '',
    variant: 'filled',
  };
};
