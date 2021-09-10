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
import {
  SelectAutocomplete,
  SelectAutocompleteProps,
} from './SelectAutocomplete';
import { FormSelectOption } from '@energyweb/origin-ui-core';

const description =
  'Input with autocomplete and select functionality. So that the user can type into the input a label of the option he is looking for and options list will be filtered to match the text in the input. Used for selecting one or multiple values, which are then displayed as chip inside the input. Can be used on its own by providing a `value` prop and change handler as `onChange` prop. Also can be used in `react-hook-form` setup. In this case it has to be wrapped in `<Controller />` and receive `value` and `onChange` prop from its `render` prop.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
  // not necessary if this autocomplete is dependent on another field
  options?: FormSelectOption[];
  multiple?: boolean;
  maxValues?: number;
  textFieldProps?: TextFieldProps;
  // name of the field it is dependent on
  dependentOn?: string;
  // function for selecting which options to show based on the field it is dependent on
  // it will supply options to autocomplete instead of regular 'options' prop above
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
}`;

export default {
  title: 'Form / SelectAutocomplete',
  component: SelectAutocomplete,
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
      description: 'Selected value(s)',
      table: {
        type: {
          summary: 'FormSelectOption[]',
          detail: `Array<{ label: string; value: string | number }>`,
        },
      },
      control: false,
    },
    onChange: {
      type: { required: true },
      description: 'Change handler',
      table: {
        type: {
          summary: '(newValue: FormSelectOption[]) => void',
        },
      },
    },
    field: {
      type: { required: true },
      description:
        'Object containing all the field data used for `TextField` setup',
      table: {
        type: {
          summary: 'SelectAutocompleteField<FormValuesType>',
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
      defaultValue: 'filled',
      table: {
        defaultValue: { summary: 'filled' },
      },
    },
    className: {
      type: { required: false },
      description: 'Class name supplied to `Autocomplete` component',
      control: false,
    },
    dependentValue: {
      type: { required: false },
      description: 'Value of the field this autocomplete is dependent on',
      control: false,
    },
  },
} as Meta;

const Template: Story<SelectAutocompleteProps> = (args) => {
  const [value, setValue] = useState<FormSelectOption[]>([]);
  const handleChange = (newValue: FormSelectOption[]) => {
    setValue(newValue);
  };
  return <SelectAutocomplete {...args} value={value} onChange={handleChange} />;
};

export const SingleSelect = Template.bind({});
SingleSelect.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Select item',
    options: [
      { label: 'Option 1', value: 'opt-1' },
      { label: 'Option 2', value: 'opt-2' },
      { label: 'Option 3', value: 'opt-3' },
      { label: 'Option 4', value: 'opt-4' },
    ],
  },
};

export const MultipleSelect = Template.bind({});
MultipleSelect.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Select item',
    options: [
      { label: 'Option 1', value: 'opt-1' },
      { label: 'Option 2', value: 'opt-2' },
      { label: 'Option 3', value: 'opt-3' },
      { label: 'Option 4', value: 'opt-4' },
    ],
    multiple: true,
  },
};

export const WithLimit = Template.bind({});
WithLimit.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Select item (2 max)',
    options: [
      { label: 'Option 1', value: 'opt-1' },
      { label: 'Option 2', value: 'opt-2' },
      { label: 'Option 3', value: 'opt-3' },
      { label: 'Option 4', value: 'opt-4' },
    ],
    multiple: true,
    maxValues: 2,
  },
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  field: {
    name: 'selectAutocompleteTest',
    label: 'Select item',
    options: [
      { label: 'Option 1', value: 'opt-1' },
      { label: 'Option 2', value: 'opt-2' },
      { label: 'Option 3', value: 'opt-3' },
      { label: 'Option 4', value: 'opt-4' },
    ],
    multiple: true,
    maxValues: 2,
    placeholder: 'Select up to 3 options',
  },
};

export const DependentSelect = (args: SelectAutocompleteProps) => {
  const [firstValue, setFirstValue] = useState<FormSelectOption[]>([]);
  const [secondValue, setSecondValue] = useState<FormSelectOption[]>([]);
  const handleFirstChange = (newValue: FormSelectOption[]) => {
    setFirstValue(newValue);
  };
  const handleSecondChange = (newValue: FormSelectOption[]) => {
    setSecondValue(newValue);
  };
  return (
    <div>
      <SelectAutocomplete
        field={{
          name: 'mainSelect',
          label: 'Main select',
          options: [
            { label: 'Size', value: 'size' },
            { label: 'Color', value: 'color' },
          ],
        }}
        value={firstValue}
        onChange={handleFirstChange}
      />
      <SelectAutocomplete
        {...args}
        value={secondValue}
        onChange={handleSecondChange}
        dependentValue={firstValue}
      />
    </div>
  );
};

const secondaryOptions: Record<string, FormSelectOption[]> = {
  size: [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Big', value: 'big' },
  ],
  color: [
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Purple', value: 'purple' },
  ],
};

DependentSelect.args = {
  field: {
    name: 'secondarySelect',
    label: 'Secondary Select',
    dependentOn: 'mainSelect',
    dependentOptionsCallback: (mainValue: FormSelectOption[]) => {
      return secondaryOptions[mainValue[0]?.value];
    },
  },
};
