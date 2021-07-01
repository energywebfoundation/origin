import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { prepareFuelTypesOptions } from '../utils';

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
  return {
    value,
    onChange,
    field: {
      name: 'fuelType',
      label: 'Fuel type',
      options: prepareFuelTypesOptions(allFuelTypes),
      multiple: true,
    },
    errorExists: null,
    errorText: '',
    variant: 'filled',
  };
};
