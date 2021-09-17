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
import { FormDatePicker, FormDatePickerProps } from './FormDatePicker';

const description = 'Date picker input for using inside `react-hook-form`';
const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
  textFieldProps?: TextFieldProps;
}`;

export default {
  title: 'Form / FormDatePicker',
  component: FormDatePicker,
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
      defaultValue: 'standard',
      table: {
        defaultValue: { summary: 'standard' },
      },
    },
  },
} as Meta;

const Template: Story<FormDatePickerProps<any>> = (args) => {
  const { control } = useForm({ defaultValues: { formDatepickerTest: '' } });
  return <FormDatePicker control={control} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  field: {
    name: 'formDatepickerTest',
    label: 'Date picker test',
  },
};
