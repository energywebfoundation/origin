/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { TimeframeSelect, TimeframeSelectProps } from './TimeframeSelect';
import dayjs, { Dayjs } from 'dayjs';

const description = '';

const pickerTypeDetail = `{
  value: Dayjs;
  onChange: (value: Dayjs) => void;

  // type described below
  field: DatePickerField;

  disabled?: boolean;
  errorExists?: boolean;
  errorText?: string;
  variant?: TextFieldProps['variant'];
}

type DatePickerField = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  textFieldProps?: TextFieldProps;
};

`;

export default {
  title: 'Layout / TimeframeSelect',
  component: TimeframeSelect,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title />
          <Description>{description}</Description>
          <Primary />
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
  argTypes: {
    fromPickerProps: {
      description: 'Props for From Date picker',
      table: {
        type: { detail: pickerTypeDetail, summary: 'MaterialDatepickerProps' },
      },
      control: false,
    },
    toPickerProps: {
      description: 'Props for To Date picker',
      table: {
        type: { detail: pickerTypeDetail, summary: 'MaterialDatepickerProps' },
      },
      control: false,
    },
    title: {
      description: 'Text to be rendered next to the Datepickers',
    },
    titleProps: {
      description: 'Props supplied to `Typography` component of title',
      table: { type: { summary: 'TypographyProps' } },
      control: false,
    },
    titleWrapperProps: {
      description: 'Props supplied `Grid` component holding a title',
      table: { type: { summary: 'GridProps' } },
      control: false,
    },
    wrapperProps: {
      description: 'Props supplied to the wrapper `Box` component',
      table: { type: { summary: 'BoxProps' } },
      control: false,
    },
    containerProps: {
      description:
        'Props supplied `Grid container` component holding title and datepickers',
      table: { type: { summary: 'GridProps' } },
      control: false,
    },
    pickersContainerProps: {
      description: 'Props supplied `Grid` component holding datepickers',
      table: { type: { summary: 'GridProps' } },
      control: false,
    },
    dividerProps: {
      description:
        'Props supplied `Box` component serving as a divider between From and To datepickers',
      table: { type: { summary: 'BoxProps' } },
      control: false,
    },
    customDivider: {
      description: 'Custom component to divide From and To datepickers',
      table: { type: { summary: 'ReactNode' } },
      control: false,
    },
  },
} as Meta;

const Template: Story<TimeframeSelectProps> = (args) => {
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

export const Default = Template.bind({});
Default.args = {};

export const WithTitle = Template.bind({});
WithTitle.args = {
  title: 'Select time frame',
};

export const WithCustomDivider = Template.bind({});
WithCustomDivider.args = {
  title: 'Select time frame',
  customDivider: (
    <div
      style={{
        backgroundColor: 'red',
        width: '2px',
        height: '50px',
        margin: '10px',
      }}
    ></div>
  ),
};
