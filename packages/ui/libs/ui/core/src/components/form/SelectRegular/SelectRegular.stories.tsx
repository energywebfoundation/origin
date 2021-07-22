import React from 'react';
import { Meta } from '@storybook/react';
import { SelectRegular, SelectRegularProps } from './SelectRegular';
import { Controller, useForm } from 'react-hook-form';

export default {
  title: 'Form / SelectRegular',
  component: SelectRegular,
  parameters: {
    controls: {
      exclude: ['value', 'onChange'],
    },
  },
} as Meta;

export const Default = (
  args: Omit<SelectRegularProps, 'value' | 'onChange'>
) => {
  const { control } = useForm({ defaultValues: { selectAutocomplete: '' } });
  return (
    <Controller
      name={'selectAutocomplete'}
      control={control}
      render={({ field: { value, onChange } }) => (
        <SelectRegular value={value} onChange={onChange} {...args} />
      )}
    />
  );
};
Default.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Default SelectRegular',
    select: true,
    options: [
      { label: 'First option', value: 1 },
      { label: 'Second variant', value: 2 },
      { label: 'Third value', value: 3 },
      { label: 'Fourth value', value: 4 },
    ],
  },
  errorExists: false,
  errorText: '',
};

export const WithError = (
  args: Omit<SelectRegularProps, 'value' | 'onChange'>
) => {
  const { control } = useForm({ defaultValues: { selectAutocomplete: '' } });
  return (
    <Controller
      name={'selectAutocomplete'}
      control={control}
      render={({ field: { value, onChange } }) => (
        <SelectRegular value={value} onChange={onChange} {...args} />
      )}
    />
  );
};
WithError.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Default SelectRegular',
    select: true,
    options: [
      { label: 'First option', value: 1 },
      { label: 'Second variant', value: 2 },
      { label: 'Third value', value: 3 },
      { label: 'Fourth value', value: 4 },
    ],
  },
  errorExists: true,
  errorText: 'It is a required field',
};
