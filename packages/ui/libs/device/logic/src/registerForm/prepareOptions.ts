import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { FormSelectOption } from '@energyweb/origin-ui-core';
import { fuelToDeviceTypesMatching } from '../utils';

export const prepareFuelTypesOptions = (
  allFuelTypes: CodeNameDTO[]
): FormSelectOption[] => {
  if (!allFuelTypes) {
    return [];
  }

  const options: FormSelectOption[] = allFuelTypes.map((type) => ({
    value: type.code,
    label: type.name,
  }));
  return options;
};

export const prepareDeviceTypesOptions = (
  allDeviceTypes: CodeNameDTO[]
): ((selected: FormSelectOption[]) => FormSelectOption[]) => {
  return (selectedFuelOption: FormSelectOption[]) => {
    const selectedValue = selectedFuelOption[0]?.value;

    const availableTypesForSelectedFuel: string[] =
      fuelToDeviceTypesMatching[selectedValue];
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
