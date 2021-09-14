import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';
import { sortedUniq } from 'lodash';
import { prepareDeviceTypesOptions } from '../utils';

type TGetDeviceTypeOptionArgs = {
  deviceType: string[];
  fuelTypeOptions: FormSelectOption[];
  allFuelTypes: CodeNameDTO[];
  allDeviceTypes: CodeNameDTO[];
};

export const getDeviceTypeOption = ({
  deviceType,
  fuelTypeOptions,
  allFuelTypes,
  allDeviceTypes,
}: TGetDeviceTypeOptionArgs) => {
  const dedupedDeviceTypes = sortedUniq(deviceType);

  const typesMatchingFunc = prepareDeviceTypesOptions(
    allFuelTypes,
    allDeviceTypes
  );
  const allAvailableOptions = typesMatchingFunc(fuelTypeOptions);

  const selectedTypes = allAvailableOptions.filter((option) =>
    dedupedDeviceTypes.includes(option.value as string)
  );

  return selectedTypes;
};
