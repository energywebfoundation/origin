/* deepscan-disable */
import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs';
import { SelectRegular, SelectRegularProps } from './SelectRegular';
import { Controller, useForm } from 'react-hook-form';

const description =
  'Input with select functionality. Can be used on its own by providing a `value` prop and change handler as `onChange` prop. Also can be used in `react-hook-form` setup. In this case it has to be wrapped in `<Controller />` and receive `value` and `onChange` prop from its `render` prop.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  placeholder?: string;
  required?: boolean;
  // provided in case you want to show user
  // a default input for typing custom value
  // when provided options are not enough
  // could be used only inside react-hook-form
  additionalInputProps?: {
    valueToOpen: string | number;
    name: string;
    label: string;
    required: boolean;
    register: UseFormRegister<FormValuesType>
  };
  textFieldProps?: TextFieldProps;
}`;

export default {
  title: 'Form / SelectRegular',
  component: SelectRegular,
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
    value: {
      type: { required: true },
      description: 'Selected value',
      control: false,
    },
    onChange: {
      type: { required: true },
      description: 'Change handler',
      table: {
        type: {
          summary: '(event: React.ChangeEvent<HTMLInputElement>) => void',
        },
      },
    },
    field: {
      type: { required: true },
      description:
        'Object containing all the field data used for `TextField` setup',
      table: {
        type: {
          summary: 'SelectRegularProps<FormValuesType>',
          detail: fieldTypeDescription,
        },
      },
    },
    errorExists: {
      type: { required: false },
      description:
        'If using as a part of `react-hook-form` this prop could be received by checking form context for errors existing in this particular field. Specifiying it as `true` marks input as errored. If using outside `react-hook-form` could be provided some custom logic.',
      defaultValue: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    errorText: {
      type: { required: false },
      description:
        'If using as a part of `react-hook-form` prop which could be received by checking form context for error message in this particular field. This property is used as `helperText` below the Input. If using outside `react-hook-form` could be provided some custom logic.',
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

const Template: Story<SelectRegularProps> = (args) => {
  const [value, setValue] = useState<string>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  return <SelectRegular {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  field: {
    name: 'selectRegularTest',
    label: 'Default SelectRegular',
    options: [
      { label: 'First option', value: 'one' },
      { label: 'Second variant', value: 'two' },
      { label: 'Third value', value: 'three' },
      { label: 'Fourth value', value: 'four' },
    ],
  },
  errorExists: false,
  errorText: '',
};

export const WithError = Template.bind({});
WithError.args = {
  field: {
    name: 'selectRegularTest',
    label: 'Default SelectRegular',
    options: [
      { label: 'First option', value: 'one' },
      { label: 'Second variant', value: 'two' },
      { label: 'Third value', value: 'three' },
      { label: 'Fourth value', value: 'four' },
    ],
  },
  errorExists: true,
  errorText: 'It is a required field',
};

const initialValues = {
  title: '',
  titleInput: '',
};

const ReactHookFormTemplate: Story<SelectRegularProps> = (args) => {
  const { control, register } = useForm({ defaultValues: initialValues });
  const adjustedArgs = {
    ...args,
    field: {
      ...args.field,
      name: args.field.name as any,
      additionalInputProps: {
        name: 'titleInput' as any,
        label: 'Enter custom title',
        valueToOpen: 'Other',
        register: register,
      },
    },
  };
  return (
    <form>
      <Controller
        name={'title'}
        control={control}
        render={({ field: { value, onChange } }) => (
          <SelectRegular value={value} onChange={onChange} {...adjustedArgs} />
        )}
      />
    </form>
  );
};

export const WithAdditionalInput = ReactHookFormTemplate.bind({});
WithAdditionalInput.args = {
  field: {
    name: 'title',
    label: 'Select title',
    options: [
      { label: 'Mr', value: 'Mr' },
      { label: 'Mrs', value: 'Mrs' },
      { label: 'Other', value: 'Other' },
    ],
  },
};
