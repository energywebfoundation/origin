import React from 'react';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormSelect, FormSelectProps } from './FormSelect';

export default {
  title: 'Form / FormSelect',
  component: FormSelect,
} as Meta;

export const Regular = (args: Omit<FormSelectProps, 'control'>) => {
  const { control } = useForm({
    defaultValues: { test: 1 },
  });

  return <FormSelect control={control} {...args} />;
};
Regular.args = {
  field: {
    name: 'test',
    label: 'Default Regular FormSelect',
    select: true,
    options: [
      { value: 1, label: 'First option' },
      { value: 2, label: 'Second option' },
      { value: 3, label: 'Third option' },
    ],
  },
  errorExists: false,
  errorText: '',
};

export const Autocomplete = (args: Omit<FormSelectProps, 'control'>) => {
  const { control } = useForm({
    defaultValues: { test: 1 },
  });

  return <FormSelect control={control} {...args} />;
};
Autocomplete.args = {
  field: {
    name: 'test',
    label: 'Autocomplete FormSelect',
    select: true,
    autocomplete: true,
    options: [
      { value: 1, label: 'First option' },
      { value: 2, label: 'Second option' },
      { value: 3, label: 'Third option' },
    ],
  },
  errorExists: false,
  errorText: '',
};

export const AutocompleteMultipleValues = (
  args: Omit<FormSelectProps, 'control'>
) => {
  const { control } = useForm({
    defaultValues: { test: 1 },
  });

  return <FormSelect control={control} {...args} />;
};
AutocompleteMultipleValues.args = {
  field: {
    name: 'test',
    label: 'Autocomplete FormSelect with multiple values',
    select: true,
    autocomplete: true,
    multiple: true,
    options: [
      { value: 1, label: 'First option' },
      { value: 2, label: 'Second option' },
      { value: 3, label: 'Third option' },
    ],
  },
  errorExists: false,
  errorText: '',
};
