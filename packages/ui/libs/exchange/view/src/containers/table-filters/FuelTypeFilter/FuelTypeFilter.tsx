import {
  FormSelectOption,
  SelectAutocomplete,
} from '@energyweb/origin-ui-core';
import { useCachedAllFuelTypes } from '@energyweb/origin-ui-exchange-data';
import { prepareFuelTypesOptions } from '@energyweb/origin-ui-exchange-logic';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface FuelTypeFilterProps {
  value: FormSelectOption[];
  handleFilterChange: (newValue: FormSelectOption[] | undefined) => void;
}

export const FuelTypeFilter: FC<FuelTypeFilterProps> = ({
  value,
  handleFilterChange,
}) => {
  const { t } = useTranslation();
  const allTypes = useCachedAllFuelTypes();
  const handleChange = (value: FormSelectOption[]) => {
    handleFilterChange(value);
  };
  return (
    <SelectAutocomplete
      field={{
        name: 'fuelTypeFilter',
        label: t('exchange.myOrders.fuelType'),
        options: prepareFuelTypesOptions(allTypes),
        multiple: true,
      }}
      variant="filled"
      value={value || []}
      onChange={handleChange}
    />
  );
};
