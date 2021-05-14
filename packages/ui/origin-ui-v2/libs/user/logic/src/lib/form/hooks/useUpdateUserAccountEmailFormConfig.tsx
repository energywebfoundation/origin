import { GenericFormProps } from '@energyweb/origin-ui-core';
import { UnpackNestedValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

export type TUpdateUserEmailFormValues = { email: string };

const INITIAL_FORM_VALUES: TUpdateUserEmailFormValues = {
  email: '',
};

export const useUpdateUserAccountEmailFormConfig = (
  initialValues: TUpdateUserEmailFormValues,
  formSubmitHandler: (
    values: UnpackNestedValue<TUpdateUserEmailFormValues>
  ) => void
): GenericFormProps<TUpdateUserEmailFormValues> => {
  const { t } = useTranslation();

  return {
    buttonFullWidth: true,
    buttonText: t('Save'),
    fields: [
      {
        label: t('user.properties.email'),
        name: 'email',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: INITIAL_FORM_VALUES,
    submitHandler: formSubmitHandler,
    validationSchema: Yup.object().shape({
      email: Yup.string().email().label(t('user.properties.email')).required(),
    }),
  };
};
