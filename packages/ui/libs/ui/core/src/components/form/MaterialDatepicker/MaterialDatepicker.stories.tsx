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
  MaterialDatepicker,
  MaterialDatepickerProps,
} from '@energyweb/origin-ui-core';
import { Dayjs } from 'dayjs';

const description =
  'Date picker built on top of Material-UI <a target="_blank" href="https://next.material-ui.com/api/date-picker/">DatePicker</a>. ' +
  'Component is wrapped into `dayjs` LocalizationProvider. <br/>' +
  'Works as standalone component by providing `value` and `onChange` properties. <br/>' +
  'Can be used inside `react-hook-form` by wrapping into `<Controller />`, receiving `value` and `onChange` from its `render` prop. <br/>' +
  'Has default styles and configuration. For more custom solution - please use original DatePicker from `@material-ui/lab`.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  placeholder?: string;
  required?: boolean;
  textFieldProps?: TextFieldProps;
}`;

export default {
  title: 'Form / MaterialDatepicker',
  component: MaterialDatepicker,
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
          summary: 'DatePickerField<FormValuesType>',
          detail: fieldTypeDescription,
        },
      },
    },
    value: {
      control: false,
    },
    onChange: {
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

const Template: Story<MaterialDatepickerProps> = (args) => {
  const [value, setValue] = useState<Dayjs>(null);
  const handleChange = (newValue: Dayjs) => {
    setValue(newValue);
  };
  return <MaterialDatepicker {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  field: {
    name: 'materialDatepicker',
    label: 'Material Datepicker test',
  },
};
