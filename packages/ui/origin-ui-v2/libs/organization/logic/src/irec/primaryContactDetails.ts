// @should-localize
import { MultiStepFormItem } from '@energyweb/origin-ui-core';
import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '../options';

export const primaryContactDetails: MultiStepFormItem = {
  formTitle: 'Primary Contact Details',
  formTitleVariant: 'h5',
  inputsVariant: 'filled',
  initialValues: {
    primaryContactOrganizationName: '',
    primaryContactOrganizationAddress: '',
    primaryContactOrganizationPostalCode: '',
    primaryContactOrganizationCountry: '',
    subsidiaries: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhoneNumber: '',
    primaryContactFax: '',
  },
  validationSchema: yup.object().shape({
    primaryContactOrganizationName: yup
      .string()
      .required()
      .label('organization.registration.primaryContactOrgName'),
    primaryContactOrganizationAddress: yup
      .string()
      .required()
      .label('organization.registration.primaryContactOrgAddress'),
    primaryContactOrganizationPostalCode: yup
      .string()
      .required()
      .label('organization.registration.primaryContactOrgPostalCode'),
    primaryContactOrganizationCountry: yup
      .string()
      .required()
      .label('organization.registration.primaryContactOrgCountry'),
    subsidiaries: yup
      .string()
      .label('organization.registration.existingIRECOrg'),
    primaryContactName: yup
      .string()
      .required()
      .label('organization.registration.primaryContactName'),
    primaryContactEmail: yup
      .string()
      .email()
      .required()
      .label('organization.registration.primaryContactEmail'),
    primaryContactPhoneNumber: yup
      .string()
      .required()
      .label('organization.registration.primaryContactPhoneNumber'),
    primaryContactFax: yup
      .string()
      .required()
      .label('organization.registration.primaryContactFax'),
  }),
  fields: [
    {
      name: 'primaryContactOrganizationName',
      label: 'Organization Name',
    },
    {
      name: 'primaryContactOrganizationAddress',
      label: 'Organization Address',
    },
    {
      name: 'primaryContactOrganizationPostalCode',
      label: 'Organization postal code',
    },
    {
      name: 'primaryContactOrganizationCountry',
      label: 'Organization Country',
      select: true,
      autocomplete: true,
      options: COUNTRY_OPTIONS_ISO,
    },
    {
      name: 'subsidiaries',
      label: 'Existing I-REC organization(s) to become subsidiary',
    },
    {
      name: 'primaryContactName',
      label: 'Contact person name',
    },
    {
      name: 'primaryContactEmail',
      label: 'Contact person email',
    },
    {
      name: 'primaryContactPhoneNumber',
      label: 'Contact person telephone',
    },
    {
      name: 'primaryContactFax',
      label: 'Contact person fax',
    },
  ],
  buttonText: 'Next step',
};
