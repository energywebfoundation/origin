import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { prepareFuelTypesOptions } from '../utils';
import { useTranslation } from 'react-i18next';

type TUseFuelTypeFilterLogic = (
  allFuelTypes: CodeNameDTO[],
  value: FormSelectOption[],
  onChange: (...event: any[]) => void
) => SelectAutocompleteProps;

export const useFuelTypeFilterLogic: TUseFuelTypeFilterLogic = (
  allFuelTypes,
  value,
  onChange
) => {
  const { t } = useTranslation();
  return {
    value,
    onChange,
    field: {
      name: 'fuelType',
      label: t('exchange.viewMarket.fuelType'),
      options: prepareFuelTypesOptions(allFuelTypes),
      multiple: true,
    },
    variant: 'filled',
  };
};
