import { useTranslation } from 'react-i18next';
import { UseFormReset } from 'react-hook-form';
import { useBeneficiaryControllerCreateBeneficiary } from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';

export type TCreateBeneficiaryFormValues = {
  name: string;
  countryCode: FormSelectOption[];
  location: string;
};

export const useCreateBeneficiaryHandler = () => {
  const { t } = useTranslation();
  const { mutate } = useBeneficiaryControllerCreateBeneficiary();

  const createHandler = (
    values: TCreateBeneficiaryFormValues,
    reset: UseFormReset<TCreateBeneficiaryFormValues>
  ) => {
    const formattedValues = {
      ...values,
      countryCode: values.countryCode[0].value as string,
    };

    mutate(
      { data: formattedValues },
      {
        onSuccess: () => {
          showNotification(
            t(
              'organization.createBeneficiary.notifications.createBeneficiarySuccess'
            ),
            NotificationTypeEnum.Success
          );
          reset();
        },
        onError: (error) => {
          console.log(error);
          showNotification(
            t(
              'organization.createBeneficiary.notifications.createBeneficiaryError'
            ),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return createHandler;
};
