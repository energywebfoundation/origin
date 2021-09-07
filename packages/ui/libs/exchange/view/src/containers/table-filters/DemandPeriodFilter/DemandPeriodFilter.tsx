import { TimeFrame } from '@energyweb/exchange-irec-react-query-client';
import { SelectRegular } from '@energyweb/origin-ui-core';
import { periodTypeOptions } from '@energyweb/origin-ui-exchange-logic';
import { IconButton, InputAdornment } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface PeriodFilterProps {
  value: TimeFrame;
  handleFilterChange: (newValue: TimeFrame | undefined) => void;
}

export const DemandPeriodFilter: FC<PeriodFilterProps> = ({
  value,
  handleFilterChange,
}) => {
  const { t } = useTranslation();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(event.target.value as TimeFrame);
  };
  const handleClear = () => {
    handleFilterChange(undefined);
  };
  return (
    <SelectRegular
      field={{
        name: 'periodFilter',
        label: t('exchange.myOrders.period'),
        options: periodTypeOptions(t, false),
        textFieldProps: {
          margin: 'dense',
          InputProps: value
            ? {
                endAdornment: (
                  <InputAdornment position="end" style={{ marginRight: 15 }}>
                    <IconButton onClick={handleClear}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined,
        },
      }}
      variant="filled"
      value={value}
      onChange={handleChange}
    />
  );
};
