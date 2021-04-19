// @should-localize
import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '../options';

export const signatoryInfoForm: MultiStepFormItem = {
  formTitle: 'Authorized Signatory Information',
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    signatoryFullName: '',
    signatoryAddress: '',
    signatoryZipCode: '',
    signatoryCity: '',
    signatoryCountry: '',
    signatoryEmail: '',
    signatoryTelephone: '',
  },
  validationSchema: yup.object().shape({
    signatoryFullName: yup
      .string()
      .required('Signatory Full Name is a required field'),
    signatoryAddress: yup
      .string()
      .required('Signatory Address is a required field'),
    signatoryZipCode: yup
      .string()
      .required('Signatory Zip Code is a required field'),
    signatoryCity: yup.string().required('Signatory City is a required field'),
    signatoryCountry: yup
      .string()
      .required('Signatory Country is a required field'),
    signatoryEmail: yup
      .string()
      .email('Signatory Email should be a valid email')
      .required('Signatory Email is a required field'),
    signatoryTelephone: yup
      .string()
      .required('Signatory Telephone is a required field'),
  }),
  fields: [
    {
      name: 'signatoryFullName',
      label: 'Signatory Full Name',
    },
    {
      name: 'signatoryAddress',
      label: 'Signatory Address',
    },
    {
      name: 'signatoryZipCode',
      label: 'Signatory Zip Code',
    },
    {
      name: 'signatoryCity',
      label: 'Signatory City',
    },
    {
      name: 'signatoryCountry',
      label: 'Signatory Country',
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'signatoryEmail',
      label: 'Signatory Email',
    },
    {
      name: 'signatoryTelephone',
      label: 'Signatory Telephone',
    },
  ],
  buttonText: 'Submit form',
};
