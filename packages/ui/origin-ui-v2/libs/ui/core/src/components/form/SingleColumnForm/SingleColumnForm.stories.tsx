import React from 'react';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { SingleColumnForm, SingleColumnFormProps } from './SingleColumnForm';

export default {
  title: 'Form / SingleColumnForm',
  component: SingleColumnForm,
  parameters: {
    controls: {
      exclude: ['register', 'control', 'dirtyFields', 'errors'],
    },
  },
} as Meta;

export const Default = (args: Pick<SingleColumnFormProps, 'fields'>) => {
  const { register, control, formState } = useForm({
    defaultValues: {
      test_one: '',
      test_two: '',
      test_three: '',
      test_four: '',
    },
  });
  const { dirtyFields, errors } = formState;

  return (
    <SingleColumnForm
      errors={errors}
      register={register}
      control={control}
      dirtyFields={dirtyFields}
      {...args}
    />
  );
};
Default.args = {
  fields: [
    { name: 'test_one', label: 'Test input one' },
    { name: 'test_two', label: 'Test input two' },
    { name: 'test_three', label: 'Test input three' },
    { name: 'test_four', label: 'Test input four' },
  ],
};
