import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface TextFilterProps {
  value: string;
  handleFilterChange: (newValue: string) => void;
  label: string;
}

const TextFilterComponent: FC<TextFilterProps> = ({
  value,
  handleFilterChange,
  label,
}) => {
  const handleChange = (event) => {
    handleFilterChange(event.target.value);
  };
  const handleClear = () => {
    handleFilterChange('');
  };

  return (
    <TextField
      fullWidth
      margin="dense"
      variant="filled"
      value={value || ''}
      onChange={handleChange}
      label={label}
      InputProps={{
        endAdornment: !!value ? (
          <InputAdornment position="end">
            <IconButton onClick={handleClear}>
              <Close />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
};

export const FacilityNameTextFilter: FC<Omit<TextFilterProps, 'label'>> = (
  props
) => {
  const { t } = useTranslation();
  return (
    <TextFilterComponent
      label={t('exchange.myOrders.facilityName')}
      {...props}
    />
  );
};
