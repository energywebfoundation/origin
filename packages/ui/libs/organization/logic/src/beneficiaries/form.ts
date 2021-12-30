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
      validationMode: 'onSubmit',
      initialValues: {
        name: '',
        countryCode: [],
        location: '',
      },
      validationSchema: yup.object().shape({
        name: yup
          .string()
          .required()
          .label(t('organization.createBeneficiary.name')),
        countryCode: yup
          .array()
          .required()
          .label(t('organization.createBeneficiary.country')),
        location: yup
          .string()
          .required()
          .label(t('organization.createBeneficiary.location')),
      }),
      fields: [
        {
          name: 'name',
          label: t('organization.createBeneficiary.name'),
          inputProps: { ['data-cy']: 'beneficiaryName' },
        },
        {
          name: 'countryCode',
          label: t('organization.createBeneficiary.country'),
          select: true,
          autocomplete: true,
          options: COUNTRY_OPTIONS_ISO,
          inputProps: { ['data-cy']: 'beneficiaryCountry' },
        },
        {
          name: 'location',
          label: t('organization.createBeneficiary.location'),
          inputProps: { ['data-cy']: 'beneficiaryLocation' },
        },
      ],
      buttonText: t('organization.createBeneficiary.create'),
    };
  };
