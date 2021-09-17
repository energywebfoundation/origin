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
import { Check, EmailOutlined } from '@material-ui/icons';
import { FormInput, FormInputProps } from './FormInput';

const description = 'Input for using inside `react-hook-form` forms.';

const fieldTypeDescription = `{
  name: keyof FormValuesType;
  label: string;
  type?: 'text' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    isValidCheck?: boolean;
  };
  textFieldProps?: TextFieldProps;
}`;

export default {
  title: 'Form / FormInput',
  component: FormInput,
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
      type: { required: true },
      description:
        'Object containing all the field data used for `react-hook-form` setup and `TextField` visual setup',
      table: {
        type: {
          summary: 'FormInputField<FormValues>',
          detail: fieldTypeDescription,
        },
      },
    },
    register: {
      type: { required: true },
      description:
        'Register function returned from `useForm` hook of `react-hook-form`',
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
    isDirty: {
      type: { required: false },
      description:
        'Prop used for validating particular field in case `endAdornment.isValidCheck` is set to `true` inside `field` object. This property could be received from `formState` of `useForm` hook',
      defaultValue: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    disabled: {
      type: { required: false },
      defaultValue: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
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

type TFormValues = {
  test: string;
};

const Template: Story<FormInputProps<TFormValues>> = (args) => {
  const { register } = useForm();
  return <FormInput register={register} {...args} />;
};

export const Standard = Template.bind({});
Standard.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const Filled = Template.bind({});
Filled.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
  variant: 'filled' as any,
};

export const Outlined = Template.bind({});
Outlined.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
  variant: 'outlined' as any,
};

export const Error = Template.bind({});
Error.args = {
  field: {
    name: 'test',
    label: 'Test input',
  },
  errorExists: true,
  errorText: 'Test input is a required field',
  isDirty: false,
};

export const Password = Template.bind({});
Password.args = {
  field: {
    name: 'test',
    label: 'Password type input',
    type: 'password',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const Number = Template.bind({});
Number.args = {
  field: {
    name: 'test',
    label: 'Number type input',
    type: 'number',
  },
  errorExists: false,
  errorText: '',
  isDirty: false,
};

export const StartAdornment = Template.bind({});
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

export const EndAdornment = Template.bind({});
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

export const BothAdornments = Template.bind({});
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
