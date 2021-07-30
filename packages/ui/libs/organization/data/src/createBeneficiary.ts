import { useTranslation } from 'react-i18next';
import { UseFormReset } from 'react-hook-form';
import { AxiosError } from 'axios';
import { useBeneficiaryControllerCreateBeneficiary } from '@energyweb/origin-organization-irec-api-react-query-client';
import { TCreateBeneficiaryFormValues } from '@energyweb/origin-ui-organization-logic';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';

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
        onError: (error: AxiosError) => {
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
