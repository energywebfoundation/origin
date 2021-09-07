import React, { FC } from 'react';
import { MaterialDatepicker } from '@energyweb/origin-ui-core';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface DateFilterProps {
  value: Dayjs;
  handleFilterChange: (newValue: Dayjs) => void;
  label: string;
}

const DateFilterComponent: FC<DateFilterProps> = ({
  value,
  handleFilterChange,
  label,
}) => {
  const handleChange = (eventValue: Dayjs) => {
    handleFilterChange(eventValue);
  };
  return (
    <MaterialDatepicker
      field={{
        name: 'dateFilter',
        label: label,
        textFieldProps: {
          margin: 'dense',
        },
      }}
      value={value || null}
      onChange={handleChange}
      variant="filled"
    />
  );
};

export const StartDateFilter: FC<Omit<DateFilterProps, 'label'>> = (props) => {
  const { t } = useTranslation();
  return (
    <DateFilterComponent label={t('exchange.myOrders.startDate')} {...props} />
  );
};

export const EndDateFilter: FC<Omit<DateFilterProps, 'label'>> = (props) => {
  const { t } = useTranslation();
  return (
    <DateFilterComponent label={t('exchange.myOrders.endDate')} {...props} />
  );
};
