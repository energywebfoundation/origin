import { GenericFormProps } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

type TUpdateUserEmailFormValues = {
  email: string;
};

export const useUpdateUserAccountEmailFormConfig = (
  initialValues: TUpdateUserEmailFormValues
): Omit<GenericFormProps<TUpdateUserEmailFormValues>, 'submitHandler'> => {
  const { t } = useTranslation();

  return {
    buttonText: t('general.buttons.change'),
    fields: [
      {
        label: t('user.profile.email'),
        name: 'email',
      },
    ],
    buttonWrapperProps: { justifyContent: 'flex-start' },
    initialValues: { email: initialValues?.email },
    inputsVariant: 'filled',
    validationSchema: Yup.object().shape({
      email: Yup.string().email().label(t('user.profile.email')).required(),
    }),
  };
};
