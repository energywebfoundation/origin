import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { prepareDeviceTypesOptions } from '../utils';

type TUseDeviceTypeFilterLogic = (
  allDeviceTypes: CodeNameDTO[],
  value: FormSelectOption[],
  onChange: (...event: any[]) => void,
  fuelTypeValues: FormSelectOption[]
) => SelectAutocompleteProps;

export const useDeviceTypeFilterLogic: TUseDeviceTypeFilterLogic = (
  allDeviceTypes,
  value,
  onChange,
  fuelTypeValue
) => {
  return {
    value,
    onChange,
    field: {
      name: 'deviceType',
      label: 'Device type',
      select: true,
      autocomplete: true,
      multiple: true,
      dependentOn: 'fuelType',
      dependentOptionsCallback: prepareDeviceTypesOptions(allDeviceTypes),
    },
    errorExists: null,
    errorText: '',
    variant: 'filled',
    dependentValue: fuelTypeValue,
  };
};
