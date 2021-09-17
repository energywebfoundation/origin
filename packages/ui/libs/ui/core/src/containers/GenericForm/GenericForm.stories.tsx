/* deepscan-disable */
import React from 'react';
import { Meta, Story } from '@storybook/react';
import {
  Title,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  Stories,
} from '@storybook/addon-docs';
import { GenericForm } from './GenericForm';
import { GenericFormProps } from './GenericForm.types';
import * as yup from 'yup';

const description =
  'Component used for creating simple forms with multiple fields of different types. ' +
  'Built with `react-hook-form`. ';

const fieldTypeDescription = `{
  // used for registering field in react-hook-form
  name: keyof FormValuesType;
  label: string;
  type?: 'text' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  select?: boolean;
  // show additional input below regular select in case
  // certain value (e.g. "other") is selected for custom input
  additionalInputProps?: {
    valueToOpen: FormSelectOption['value'];
    name: string;
    label: string;
    required: boolean;
  };
  // options supplied for both regular select and select autocomplete
  options?: FormSelectOption[];
  autocomplete?: boolean;
  // can be used only in select autocomplete to allow selection of multiple options
  multiple?: boolean;
  // limit for multiple options selected
  maxValues?: number;
  datePicker?: boolean;
  datePickerProps?: Omit<DatePickerProps, 'value' | 'onChange' | 'renderInput'>;
  startAdornment?: ReactNode;
  endAdornment?: {
    element: ReactNode;
    // if true - checks if the filled input is valid and only then displays endAdornment
    isValidCheck?: boolean;
  };
  textFieldProps?: TextFieldProps;
  // supplied only to select autocomplete
  // and should be equal to name property of the other field it is dependent on
  dependentOn?: string;
  // callback fired when the value of the field it is dependent on changes.
  // the result of this call will be the new options supplied to the dependent field
  // following the logic described in the callback.
  // if supplied, options property could be omitted.
  dependentOptionsCallback?: (fieldValue: any) => FormSelectOption[];
}`;

export default {
  title: 'Form / Generic Form',
  component: GenericForm,
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
      description: 'Array describing all fields in the form',
      table: {
        type: {
          detail: fieldTypeDescription,
        },
      },
    },
    submitHandler: {
      description:
        'Function which receives form `values` and `resetForm` as args. Is used for submitting form normally via sending requests. `resetForm` can be used to reset form state after the request is successful',
      control: false,
    },
    validationSchema: {
      description: 'Validation schema object from `yup`',
      control: false,
    },
    initialValues: {
      description: 'Inital form values',
    },
    buttonText: {
      description: 'Text inside submit button',
    },
    validationMode: {
      description:
        'The mode of validating form according to `react-hook-form`  <a href="https://react-hook-form.com/api/useform" target="_blank">validation modes</a>',
      table: {
        defaultValue: { summary: 'onBlur' },
      },
    },
    formTitle: {
      description: 'Optional title for form',
    },
    hideSubmitButton: {
      description:
        'Prop which is supplied as `hidden` to submit `Button` component',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
    buttonFullWidth: {
      description:
        'If `true` - submit button will be stretched to the full width of form',
      table: {
        defaultValue: { summary: false },
      },
    },
    buttonWrapperProps: {
      description:
        '<a target="_blank" href="https://next.material-ui.com/components/box">`BoxProps`</a>',
      table: {
        type: null,
      },
      control: false,
    },
    buttonDisabled: {
      description: 'Prop for disabling submit button',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
    secondaryButtons: {
      description:
        '<a target="_blank" href="https://next.material-ui.com/api/button/">`ButtonProps`</a> & `{ label: string }`',
      table: {
        type: null,
      },
      control: false,
    },
    formTitleVariant: {
      description:
        'Variant of displaying form title in a `Typography` component',
    },
    formClass: {
      description: '`className` prop supplied to `form` component',
      control: false,
    },
    inputsVariant: {
      description:
        '`variant` prop applied to all TextFields throughout the form',
    },
    formInputsProps: {
      description:
        '<a target="_blank" href="https://next.material-ui.com/api/textfield">`TextFieldProps`</a> applied to all TextFields throughout the form',
      control: false,
    },
    twoColumns: {
      description:
        'Display form in 2 columns (one column if screen size smaller than laptop)',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
    partOfMultiForm: {
      description:
        'This prop should not be passed, unless creating custom multi-step form setup. Automatically passed by MultiStepForm. Affects validating form.',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
    inputsToWatch: {
      description:
        'An array of field names which values should be watched. Should be used in pair with `onWatchHandler`',
      control: false,
    },
    onWatchHandler: {
      description:
        'Callback fired when any of the watched fields values has changed. Could be used for receiving form values outside the form context.',
    },
    loading: {
      description:
        'Loading state of the form. Disables submit button and shows loader inside submit button',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
    acceptInitialValues: {
      description: 'Allows user to submit form with initial values',
      table: {
        defaultValue: { summary: false },
      },
      control: false,
    },
  },
} as Meta;

type DefaultFormValues = {
  email: string;
  password: string;
  url: string;
};

const Template: Story<GenericFormProps<DefaultFormValues>> = (args) => (
  <GenericForm {...args} />
);

export const Default = Template.bind({});
Default.args = {
  submitHandler: (values: DefaultFormValues) => {
    alert(JSON.stringify(values));
  },
  validationSchema: yup.object().shape({
    email: yup
      .string()
      .email('This should be a valid email')
      .required('Email is required field'),
    password: yup.string().min(6, 'Password should be longer than 6 symbols'),
    url: yup.string().url('Should be a valid url').notRequired(),
  }),
  initialValues: {
    email: '',
    password: '',
    url: '',
  },
  formTitle: 'Test form',
  fields: [
    {
      name: 'email',
      label: 'Email test label',
    },
    {
      name: 'password',
      label: 'Test password label',
      type: 'password',
    },
    {
      name: 'url',
      label: 'Non-required test URL',
      type: 'text',
    },
  ],
  buttonText: 'Submit',
};
