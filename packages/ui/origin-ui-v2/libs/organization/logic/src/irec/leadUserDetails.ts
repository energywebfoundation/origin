// @should-localize
import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import * as yup from 'yup';
import { TITLE_OPTIONS } from '../options';

export const leadUserDetals: MultiStepFormItem = {
  formTitle: 'Lead User Details',
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    leadUserTitle: '',
    leadUserFirstName: '',
    leadUserLastName: '',
    leadUserEmail: '',
    leadUserPhoneNumber: '',
    leadUserFax: '',
  },
  validationSchema: yup.object().shape({
    leadUserTitle: yup
      .string()
      .required()
      .label('organization.registration.leadUserTitle'),
    leadUserFirstName: yup
      .string()
      .required()
      .label('organization.registration.leadUserFirstName'),
    leadUserLastName: yup
      .string()
      .required()
      .label('organization.registration.leadUserLastName'),
    leadUserEmail: yup
      .string()
      .email()
      .required()
      .label('organization.registration.leadUserEmail'),
    leadUserPhoneNumber: yup
      .string()
      .required()
      .label('organization.registration.leadUserPhoneNumber'),
    leadUserFax: yup
      .string()
      .required()
      .label('organization.registration.leadUserFax'),
  }),
  fields: [
    {
      name: 'leadUserTitle',
      label: 'Title',
      select: true,
      options: TITLE_OPTIONS,
    },
    {
      name: 'leadUserFirstName',
      label: 'First name',
    },
    {
      name: 'leadUserLastName',
      label: 'Last name',
    },
    {
      name: 'leadUserEmail',
      label: 'Email',
    },
    {
      name: 'leadUserPhoneNumber',
      label: 'Phone number',
    },
    {
      name: 'leadUserFax',
      label: 'Fax',
    },
  ],
  buttonText: 'Submit form',
};
