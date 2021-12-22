import {
  FormSelectOption,
  SelectAutocompleteProps,
} from '@energyweb/origin-ui-core';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { prepareDeviceTypesOptions } from '../utils';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

type TUseDeviceTypeFilterLogic = (
  allFuelTypes: CodeNameDTO[],
  allDeviceTypes: CodeNameDTO[],
  value: FormSelectOption[],
  onChange: (...event: any[]) => void,
  fuelTypeValues: FormSelectOption[]
) => SelectAutocompleteProps;

export const useDeviceTypeFilterLogic: TUseDeviceTypeFilterLogic = (
  allFuelTypes,
  allDeviceTypes,
  value,
  onChange,
  fuelTypeValue
) => {
  const { t } = useTranslation();
  const dependentDeviceTypeCallback = useMemo(
    () => prepareDeviceTypesOptions(allFuelTypes, allDeviceTypes),
    [allFuelTypes, allDeviceTypes]
  );
  return {
    value,
    onChange,
    field: {
      name: 'deviceType',
      label: t('exchange.viewMarket.deviceType'),
      multiple: true,
      dependentOn: 'fuelType',
      dependentOptionsCallback: dependentDeviceTypeCallback,
    },
    errorExists: null,
    errorText: '',
    variant: 'filled',
    dependentValue: fuelTypeValue,
  };
};
