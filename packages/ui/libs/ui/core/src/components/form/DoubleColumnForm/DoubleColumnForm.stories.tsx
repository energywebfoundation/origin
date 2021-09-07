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
import { SingleColumnFormProps } from '../SingleColumnForm';
import { DoubleColumnForm } from './DoubleColumnForm';

const description =
  'Component which represents a set of inputs and used inside `react-hook-form` forms for displaying fields in 2 columns.' +
  `<br/>` +
  'Has built-in responsive behaviour starting below 1280px screen width - becoming a single column form.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  type?: 'text' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  select?: boolean;
  additionalInputProps?: {
    valueToOpen: FormSelectOption['value'];
    name: string;
    label: string;
    required: boolean;
    register: UseFormRegister<FormValuesType>;
  };
  options?: FormSelectOption[];
  autocomplete?: boolean;
  multiple?: boolean;
  maxValues?: number;
  datePicker?: boolean;
  datePickerProps?: Omit<DatePickerProps, 'value' | 'onChange' | 'renderInput'>;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
  textFieldProps?: TextFieldProps;
  dependentOn?: string;
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
}`;

export default {
  title: 'Form / DoubleColumnForm',
  component: DoubleColumnForm,
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
    fields: {
      description: 'All form fields',
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
    register: {
      description: '`register` function received from `useForm` hook',
      control: false,
    },
    errors: {
      description:
        '`errors` object destructured out of `formState` from `useForm` hook',
      control: false,
    },
    dirtyFields: {
      description:
        'Object containing all dirty fields. Destructured out of `formState` from `useForm` hook',
      control: false,
    },
    disabled: {
      description: 'Disable all form inputs',
    },
  },
} as Meta;

const Template: Story<SingleColumnFormProps<any>> = (args) => {
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
    <DoubleColumnForm
      errors={errors}
      register={register}
      control={control}
      dirtyFields={dirtyFields}
      {...args}
    />
  );
};
export const Default = Template.bind({});
Default.args = {
  fields: [
    { name: 'test_one', label: 'Test input one' },
    { name: 'test_two', label: 'Test input two' },
    { name: 'test_three', label: 'Test input three' },
    { name: 'test_four', label: 'Test input four' },
  ],
};
