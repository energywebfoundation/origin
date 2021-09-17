import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';
import { fuelToDeviceTypesMatching } from './fuelToDeviceTypesMatching';

export const prepareDeviceTypesOptions = (
  allDeviceTypes: CodeNameDTO[]
): ((selected: FormSelectOption[]) => FormSelectOption[]) => {
  return (selectedFuelOption: FormSelectOption[]) => {
    const selectedValue = selectedFuelOption
      ? selectedFuelOption[0]?.value
      : '';

    const availableTypesForSelectedFuel: string[] =
      fuelToDeviceTypesMatching[
        selectedValue as keyof typeof fuelToDeviceTypesMatching
      ];
    const filteredDeviceTypes = allDeviceTypes?.filter((type) =>
      availableTypesForSelectedFuel?.some(
        (available) => available === type.code
      )
    );

    const options: FormSelectOption[] = filteredDeviceTypes?.map((type) => ({
      value: type.code,
      label: type.name,
    }));

    return options;
  };
};
