import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { COUNTRY_OPTIONS_ISO } from '@energyweb/origin-ui-utils';
import { TUseCreateBeneficiaryFormLogic } from './types';

export const useCreateBeneficiaryFormLogic: TUseCreateBeneficiaryFormLogic =
  () => {
    const { t } = useTranslation();
    return {
      formTitleVariant: 'h5',
      inputsVariant: 'filled',
      initialValues: {
        name: '',
        countryCode: [],
        location: '',
      },
      validationSchema: yup.object().shape({
        name: yup
          .string()
          .required()
          .label(t('organization.beneficiaries.name')),
        countryCode: yup
          .array()
          .required()
          .label(t('organization.beneficiaries.country')),
        location: yup
          .string()
          .required()
          .label(t('organization.beneficiaries.location')),
      }),
      fields: [
        {
          name: 'name',
          label: t('organization.beneficiaries.name'),
        },
        {
          name: 'countryCode',
          label: t('organization.beneficiaries.country'),
          select: true,
          autocomplete: true,
          options: COUNTRY_OPTIONS_ISO,
          required: true,
        },
        {
          name: 'location',
          label: t('organization.beneficiaries.location'),
        },
      ],
      buttonText: t('organization.beneficiaries.create'),
    };
  };
