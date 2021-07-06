import * as yup from 'yup';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TCreatePrimaryContactDetailsForms } from './types';

export const createPrimaryContactDetailsForm: TCreatePrimaryContactDetailsForms =
  (t) => ({
    formTitle: t('organization.registerIRec.primaryContactFormTitle'),
    formTitleVariant: 'h5',
    inputsVariant: 'filled',
    initialValues: {
      primaryContactOrganizationName: '',
      primaryContactOrganizationAddress: '',
      primaryContactOrganizationPostalCode: '',
      primaryContactOrganizationCountry: [],
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
        .label(t('organization.registerIRec.primaryContactOrgName')),
      primaryContactOrganizationAddress: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactOrgAddress')),
      primaryContactOrganizationPostalCode: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactOrgPostalCode')),
      primaryContactOrganizationCountry: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactOrgCountry')),
      subsidiaries: yup
        .string()
        .label(t('organization.registerIRec.existingIRECOrg')),
      primaryContactName: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactName')),
      primaryContactEmail: yup
        .string()
        .email()
        .required()
        .label(t('organization.registerIRec.primaryContactEmail')),
      primaryContactPhoneNumber: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactPhoneNumber')),
      primaryContactFax: yup
        .string()
        .required()
        .label(t('organization.registerIRec.primaryContactFax')),
    }),
    fields: [
      {
        name: 'primaryContactOrganizationName',
        label: t('organization.registerIRec.primaryContactOrgName'),
      },
      {
        name: 'primaryContactOrganizationAddress',
        label: t('organization.registerIRec.primaryContactOrgAddress'),
      },
      {
        name: 'primaryContactOrganizationPostalCode',
        label: t('organization.registerIRec.primaryContactOrgPostalCode'),
      },
      {
        name: 'primaryContactOrganizationCountry',
        label: t('organization.registerIRec.primaryContactOrgCountry'),
        select: true,
        autocomplete: true,
        options: COUNTRY_OPTIONS_ISO,
      },
      {
        name: 'subsidiaries',
        label: t('organization.registerIRec.existingIRECOrg'),
      },
      {
        name: 'primaryContactName',
        label: t('organization.registerIRec.primaryContactName'),
      },
      {
        name: 'primaryContactEmail',
        label: t('organization.registerIRec.primaryContactEmail'),
      },
      {
        name: 'primaryContactPhoneNumber',
        label: t('organization.registerIRec.primaryContactPhoneNumber'),
      },
      {
        name: 'primaryContactFax',
        label: t('organization.registerIRec.primaryContactFax'),
      },
    ],
    buttonText: t('general.buttons.nextStep'),
  });
