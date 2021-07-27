import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';
import { fuelToDeviceTypesMatching } from './fuelToDeviceTypesMatching';

export const prepareDeviceTypesOptions = (
  allFuelTypes: CodeNameDTO[],
  allDeviceTypes: CodeNameDTO[]
): ((selected: FormSelectOption[]) => FormSelectOption[]) => {
  return (selectedFuelOptions: FormSelectOption[]) => {
    const selectedFuelValues = selectedFuelOptions.map(
      (option) => option.value
    );

    const mergedOptions = selectedFuelValues.flatMap((fuelType) => {
      const matchingDeviceTypes = fuelToDeviceTypesMatching[fuelType];
      return matchingDeviceTypes.map(
        (deviceType) => `${fuelType};${deviceType}`
      );
    });

    const availableOptions: FormSelectOption[] = mergedOptions.map(
      (mergedType) => {
        const splitType = mergedType.split(';');
        const fuelLabel = allFuelTypes.find(
          (type) => type.code === splitType[0]
        )?.name;
        const deviceLabel = allDeviceTypes.find(
          (type) => type.code === splitType[1]
        )?.name;
        const label = `${fuelLabel} - ${deviceLabel}`;

        return {
          value: mergedType,
          label,
        };
      }
    );

    return availableOptions;
  };
};
