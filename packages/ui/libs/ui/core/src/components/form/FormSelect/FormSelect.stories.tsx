/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { useForm } from 'react-hook-form';
import { FormSelect, FormSelectProps } from './FormSelect';

const description =
  'Select input for using inside `react-hook-form`. Could be either Autocomplete or Regular select. Decision depends of `field.autocomplete` property which is `boolean`.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
  additionalInputProps?: {
    valueToOpen: string | number;
    name: string;
    label: string;
    required: boolean;
    register: UseFormRegister<FormValuesType>;
  };
  options?: Array<{ label: string; value: string | number }>;
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  textFieldProps?: TextFieldProps;
  dependentOn?: string;
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
}`;

export default {
  title: 'Form / FormSelect',
  component: FormSelect,
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
    field: {
      description: 'Field data for setting up `TextField`',
      table: {
        type: {
          detail: fieldTypeDescription,
        },
      },
    },
    control: {
      description: '`control` function received from `useForm` hook',
      control: false,
    },
    errorExists: {
      type: { required: false },
      description:
        'Prop which could be received by checking form context for errors existing in this particular field. Specifiying it as `true` marks input as errored',
      defaultValue: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    errorText: {
      type: { required: false },
      description:
        'Prop which could be received by checking form context for error message in this particular field. This property is used as `helperText` below the Input.',
      defaultValue: '',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
    variant: {
      type: { required: false },
      defaultValue: 'filled',
      table: {
        defaultValue: { summary: 'filled' },
      },
    },
  },
} as Meta;

const Template: Story<FormSelectProps<{ test: number }>> = (args) => {
  const { control } = useForm({ defaultValues: { test: [] } });
  return <FormSelect control={control} {...args} />;
};

export const Regular = Template.bind({});
Regular.args = {
  field: {
    name: 'test',
    label: 'Default Regular FormSelect',
    options: [
      { value: 1, label: 'First option' },
      { value: 2, label: 'Second option' },
      { value: 3, label: 'Third option' },
    ],
  },
  errorExists: false,
  errorText: '',
};

export const Autocomplete = Template.bind({});
Autocomplete.args = {
  field: {
    name: 'test',
    label: 'Autocomplete FormSelect',
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

export const AutocompleteMultipleValues = Template.bind({});
AutocompleteMultipleValues.args = {
  field: {
    name: 'test',
    label: 'Autocomplete FormSelect with multiple values',
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
