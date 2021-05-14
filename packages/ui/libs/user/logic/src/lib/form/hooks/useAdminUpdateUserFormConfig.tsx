import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import {
  UserStatus,
  KYCStatus,
} from '@energyweb/origin-backend-react-query-client';

export type TAdminUserUpdateFormValues = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  status: UserStatus;
  kycStatus: KYCStatus;
};

const STATUS_OPTIONS = Object.keys(UserStatus).map((key) => ({
  value: key,
  label: key,
}));

const KYC_STATUS_OPTIONS = Object.keys(KYCStatus).map((key) => ({
  value: key,
  label: key,
}));

const INITIAL_FORM_VALUES: TAdminUserUpdateFormValues = {
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  status: UserStatus.Pending,
  kycStatus: KYCStatus.Pending,
};

export const useAdminUserUpdateFormConfig = (
  formSubmitHandler: (
    values: UnpackNestedValue<TAdminUserUpdateFormValues>
  ) => void
): GenericFormProps<TAdminUserUpdateFormValues> => {
  const { t } = useTranslation();

  return {
    buttonFullWidth: true,
    buttonText: t('update'),
    fields: [
      {
        label: t('user.properties.title'),
        name: 'title',
      },
      {
        label: t('user.properties.firstName'),
        name: 'firstName',
      },
      {
        label: t('user.properties.lastName'),
        name: 'lastName',
      },
      {
        label: t('user.properties.telephone'),
        name: 'telephone',
      },
      {
        label: t('user.properties.email'),
        name: 'email',
      },
      {
        label: t('user.properties.telephone'),
        name: 'telephone',
      },
      {
        label: t('user.properties.status'),
        name: 'status',
        select: true,
        options: STATUS_OPTIONS,
      },
      {
        label: t('user.properties.kycStatus'),
        select: true,
        options: KYC_STATUS_OPTIONS,
        name: 'kycStatus',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object({
      title: Yup.string().required().label('Mr'),
      firstName: Yup.string().required().label('First Name'),
      lastName: Yup.string().required().label('Last Name'),
      telephone: Yup.string().required().label('Telephone'),
      email: Yup.string().email().required().label('Email'),
    }),
  };
};
