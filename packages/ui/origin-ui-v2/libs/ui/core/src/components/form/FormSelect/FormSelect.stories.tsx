import React from 'react';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { FormSelect, FormSelectProps } from './FormSelect';

export default {
  title: 'Form / FormSelect',
  component: FormSelect,
} as Meta;

export const Default = (args: Omit<FormSelectProps, 'control'>) => {
  const methods = useForm({
    defaultValues: { test: 1 },
  });

  return <FormSelect control={methods.control} {...args} />;
};
Default.args = {
  field: {
    name: 'test',
    label: 'Test input',
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
