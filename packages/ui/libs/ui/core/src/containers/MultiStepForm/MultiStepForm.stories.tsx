import React from 'react';
import { Meta } from '@storybook/react';
import { MultiStepForm, MultiStepFormProps } from './MultiStepForm';
import * as yup from 'yup';

export default {
  title: 'Containers / MultiStepForm',
  component: MultiStepForm,
} as Meta;

export const ThreeStepForm = (args: MultiStepFormProps) => (
  <MultiStepForm {...args} />
);

ThreeStepForm.args = {
  heading: 'TEST MULTI FORM TITLE',
  submitHandler: (values) => {
    console.log(values);
  },
  forms: [
    {
      validationSchema: yup.object().shape({
        test1_1: yup.string().required('test1_1 is required field'),
        test1_2: yup.string().min(6, 'test1_2 should be longer than 6 symbols'),
        test1_3: yup.string().notRequired(),
      }),
      initialValues: {
        test1_1: '',
        test1_2: '',
        test1_3: '',
      },
      formTitle: 'Test form step 1',
      fields: [
        {
          name: 'test1_1',
          label: 'Test field 1 step 1',
        },
        {
          name: 'test1_2',
          label: 'Test field 2 step 1',
          type: 'password',
        },
        {
          name: 'test1_3',
          label: 'Test field 3 step 1',
          type: 'text',
        },
      ],
      buttonText: 'Next',
    },
    {
      validationSchema: yup.object().shape({
        test2_1: yup.string().required('test2_1 is required field'),
        test2_2: yup.string().min(6, 'test2_2 should be longer than 6 symbols'),
        test2_3: yup.string().notRequired(),
      }),
      initialValues: {
        test2_1: '',
        test2_2: '',
        test2_3: '',
      },
      formTitle: 'Test form step 2',
      fields: [
        {
          name: 'test2_1',
          label: 'Test field 1 step 2',
        },
        {
          name: 'test2_2',
          label: 'Test field 2 step 2',
          type: 'password',
        },
        {
          name: 'test2_3',
          label: 'Test field 3 step 2',
          type: 'text',
        },
      ],
      buttonText: 'Next',
    },
    {
      validationSchema: yup.object().shape({
        test3_1: yup.string().required('test3_1 is required field'),
        test3_2: yup.string().min(6, 'test3_2 should be longer than 6 symbols'),
        test3_3: yup.string().notRequired(),
      }),
      initialValues: {
        test3_1: '',
        test3_2: '',
        test3_3: '',
      },
      formTitle: 'Test form step 3',
      fields: [
        {
          name: 'test3_1',
          label: 'Test field 1 step 3',
        },
        {
          name: 'test3_2',
          label: 'Test field 2 step 3',
          type: 'password',
        },
        {
          name: 'test3_3',
          label: 'Test field 3 step 3',
          type: 'text',
        },
      ],
      buttonText: 'Submit',
    },
  ],
};
