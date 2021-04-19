import React from 'react';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { Check, EmailOutlined } from '@material-ui/icons';
import { FormInput, FormInputProps } from './FormInput';

export default {
  title: 'Form / FormInput',
  component: FormInput,
  parameters: {
    controls: {
      exclude: ['register', 'startAdornment', 'endAdornment'],
    },
  },
} as Meta;

export const Standard = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
Standard.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const Filled = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
Filled.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
  variant: 'filled',
};

export const Outlined = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
Outlined.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
  variant: 'outlined',
};

export const Error = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};

Error.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: true,
  errorText: 'Test input is a required field',
  isDirty: false,
};

export const Password = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
Password.args = {
  field: {
    name: 'test',
    label: 'Password type input',
  },
  errorExists: false,
  type: 'password',
  errorText: '',
  isDirty: false,
};

export const Number = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
Number.args = {
  field: {
    name: 'test',
    label: 'Number type input',
  },
  errorExists: false,
  type: 'number',
  errorText: '',
  isDirty: false,
};

export const StartAdornment = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
StartAdornment.args = {
  field: {
    name: 'test',
    label: 'Input with start adornment',
    startAdornment: <EmailOutlined color="primary" />,
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const EndAdornment = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
EndAdornment.args = {
  field: {
    name: 'test',
    label: 'Input with end adornment',
    endAdornment: {
      element: <Check color="secondary" />,
    },
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const BothAdornments = (args: Omit<FormInputProps, 'register'>) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};
BothAdornments.args = {
  field: {
    name: 'test',
    label: 'Input with both adornments',
    startAdornment: <EmailOutlined color="primary" />,
    endAdornment: {
      element: <Check color="secondary" />,
    },
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};
