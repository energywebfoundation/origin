import * as yup from 'yup';
import { TITLE_OPTIONS } from '../select-options';
import { TCreateLeadUserDetailsForm } from './types';

export const createLeadUserDetailsForm: TCreateLeadUserDetailsForm = (t) => ({
  formTitle: t('organization.registerIRec.leadUserFormTitle'),
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
      .label(t('organization.registerIRec.leadUserTitle')),
    leadUserFirstName: yup
      .string()
      .required()
      .label(t('organization.registerIRec.leadUserFirstName')),
    leadUserLastName: yup
      .string()
      .required()
      .label(t('organization.registerIRec.leadUserLastName')),
    leadUserEmail: yup
      .string()
      .email()
      .required()
      .label(t('organization.registerIRec.leadUserEmail')),
    leadUserPhoneNumber: yup
      .string()
      .required()
      .label(t('organization.registerIRec.leadUserPhoneNumber')),
    leadUserFax: yup
      .string()
      .required()
      .label(t('organization.registerIRec.leadUserFax')),
  }),
  fields: [
    {
      name: 'leadUserTitle',
      label: t('organization.registerIRec.leadUserTitle'),
      select: true,
      options: TITLE_OPTIONS,
    },
    {
      name: 'leadUserFirstName',
      label: t('organization.registerIRec.leadUserFirstName'),
    },
    {
      name: 'leadUserLastName',
      label: t('organization.registerIRec.leadUserLastName'),
    },
    {
      name: 'leadUserEmail',
      label: t('organization.registerIRec.leadUserEmail'),
    },
    {
      name: 'leadUserPhoneNumber',
      label: t('organization.registerIRec.leadUserPhoneNumber'),
    },
    {
      name: 'leadUserFax',
      label: t('organization.registerIRec.leadUserFax'),
    },
  ],
  buttonText: t('form.submit'),
});
