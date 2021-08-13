import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { TimeframeSelect, TimeframeSelectProps } from './TimeframeSelect';
import dayjs, { Dayjs } from 'dayjs';

export default {
  title: 'Layout / TimeframeSelect',
  component: TimeframeSelect,
} as Meta;

export const Default = (args: TimeframeSelectProps) => {
  const [from, setFrom] = useState(dayjs().subtract(1, 'day').startOf('day'));
  const [to, setTo] = useState(dayjs().endOf('day'));
  const fromPickerProps: TimeframeSelectProps['fromPickerProps'] = {
    value: from,
    onChange: (value: Dayjs) => setFrom(value),
    field: {
      name: 'from',
      label: '',
      placeholder: 'From date',
    },
  };
  const toPickerProps: TimeframeSelectProps['toPickerProps'] = {
    value: to,
    onChange: (value: Dayjs) => setTo(value),
    field: {
      name: 'to',
      label: '',
      placeholder: 'To date',
    },
  };

  return (
    <TimeframeSelect
      fromPickerProps={fromPickerProps}
      toPickerProps={toPickerProps}
      {...args}
    />
  );
};

Default.args = {
  title: 'Select timeframe',
};
