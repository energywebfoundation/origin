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
import { MultiStepForm, MultiStepFormProps } from './MultiStepForm';
import * as yup from 'yup';

const description =
  'Component used for creating multi step forms. ' +
  'Built with `GenericForm` component and based on `react-hook-form`. ';

const formsTypeDescription = `{
  // see GenericForm component docs for detailed description
  validationSchema: yup.AnyObjectSchema;
  initialValues: UnpackNestedValue<DeepPartial<FormValuesType>>;
  fields: GenericFormField<FormValuesType>[];
  buttonText: string;
  hideSubmitButton?: boolean;
  buttonFullWidth?: boolean;
  buttonWrapperProps?: BoxProps;
  buttonDisabled?: boolean;
  formTitle?: string;
  formTitleVariant?: TypographyVariant;
  formClass?: string;
  inputsVariant?: FormInputProps<FormValuesType>['variant'];
  formInputsProps?: TextFieldProps;
  partOfMultiForm?: boolean;
  twoColumns?: boolean;
  inputsToWatch?: Path<FormValuesType>[];
  onWatchHandler?: (watchedValues: unknown[]) => void;
  validationMode?: keyof ValidationMode;
  acceptInitialValues?: boolean;
  // should be true in case of any custom step not containing GenericForm component
  // e.g. Documents Upload step
  customStep?: boolean;
  // Component supplied as custom step
  component?: FC<{
    submitHandler: (values: UnpackNestedValue<any>) => Promise<void>;
    secondaryButtons?: GenericFormSecondaryButton[];
    loading?: boolean;
  }>;
}`;

export default {
  title: 'Form / MultiStepForm',
  component: MultiStepForm,
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
    heading: {
      description: 'Form heading',
    },
    forms: {
      description: 'Array of objects describing forms',
      table: {
        type: {
          detail: formsTypeDescription,
        },
      },
    },
    submitHandler: {
      description:
        'Function handling form submit action. Receives the values of all forms filled by user as an arg.',
    },
    backButtonText: {
      description:
        'Text for button which allows user to return to previous form.',
    },
    backButtonProps: {
      description:
        "<a href='https://next.material-ui.com/api/button' target='_blank'>`ButtonProps`</a>",
      table: {
        type: {
          summary: null,
        },
      },
      control: false,
    },
    headingVariant: {
      description:
        'Variant of displaying form title in a `Typography` component',
    },
    loading: {
      description:
        'Loading state of the form. Disables submit button and shows loader inside submit button',
      control: false,
    },
  },
} as Meta;

type RegisterForm = {
  email: string;
  password: string;
  username?: string;
};
type LocationForm = {
  country: string;
  city: string;
  zipCode: string;
};
type PersonalForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};
type MultiStepFormValuesType = RegisterForm & LocationForm & PersonalForm;

const Template: Story<MultiStepFormProps<MultiStepFormValuesType>> = (args) => (
  <MultiStepForm {...args} />
);

export const Default = Template.bind({});
Default.args = {
  heading: 'Test multistep form',
  submitHandler: (values: MultiStepFormValuesType) => {
    alert(JSON.stringify(values));
  },
  forms: [
    {
      validationSchema: yup.object().shape({
        email: yup.string().required('Email is required field'),
        password: yup
          .string()
          .min(6, 'Password should be longer than 6 symbols')
          .required(),
        username: yup.string().notRequired(),
      }),
      initialValues: {
        email: '',
        password: '',
        username: '',
      },
      formTitle: 'Register data',
      fields: [
        {
          name: 'email',
          label: 'Email',
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
        },
        {
          name: 'username',
          label: 'Username',
        },
      ],
      buttonText: 'Next',
    },
    {
      validationSchema: yup.object().shape({
        country: yup.string().required('Country is required field'),
        city: yup.string().required('City is required field'),
        zipCode: yup.string().required('Zip code is required field'),
      }),
      initialValues: {
        country: '',
        city: '',
        zipCode: '',
      },
      formTitle: 'Location',
      fields: [
        {
          name: 'country',
          label: 'Country',
        },
        {
          name: 'city',
          label: 'City',
        },
        {
          name: 'zipCode',
          label: 'Zip code',
        },
      ],
      buttonText: 'Next',
    },
    {
      validationSchema: yup.object().shape({
        firstName: yup.string().required('First name is required field'),
        lastName: yup.string().required('Last name is required field'),
        phoneNumber: yup.string().required('Phone number is required field'),
      }),
      initialValues: {
        firstName: '',
        lastName: '',
        phoneNumber: '',
      },
      formTitle: 'Personal data',
      fields: [
        {
          name: 'firstName',
          label: 'First name',
        },
        {
          name: 'lastName',
          label: 'Last name',
        },
        {
          name: 'phoneNumber',
          label: 'Phone number',
        },
      ],
      buttonText: 'Submit',
    },
  ],
  backButtonText: 'Back',
};
