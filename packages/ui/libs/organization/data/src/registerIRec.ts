import {
  getRegistrationControllerGetRegistrationsQueryKey,
  IRECAccountType,
  NewRegistrationDTO,
  useRegistrationControllerRegister,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { IRecRegisterFormMergedType } from '@energyweb/origin-ui-organization-logic';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useIRecRegisterHandler = (openRegisteredModal: () => void) => {
  const { mutate } = useRegistrationControllerRegister();
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const iRecOrgKey = getRegistrationControllerGetRegistrationsQueryKey();

  return (values: IRecRegisterFormMergedType) => {
    const formattedData: NewRegistrationDTO = {
      ...values,
      // @should be changed on backend and migrated
      // from int to string because of auto-gen client/enum issues
      headquarterCountry: values.headquarterCountry
        .map((option) => option.value)[0]
        .toString(),
      primaryContactOrganizationCountry:
        values.primaryContactOrganizationCountry
          .map((option) => option.value)[0]
          .toString(),
      accountType: values.accountType as unknown as IRECAccountType,
      registrationYear: Number(values.registrationYear),
      activeCountries: values.activeCountries.map((i) => i?.value as string),
    };
    mutate(
      { data: formattedData },
      {
        onSuccess: () => {
          openRegisteredModal();
          queryClient.invalidateQueries(iRecOrgKey);
        },
        onError: (error: AxiosError) => {
          console.warn('Error while registering an organization', error);

          if (error?.response?.status === 401) {
            showNotification(
              t('organization.registerIRec.notifications.unauthorized'),
              NotificationTypeEnum.Error
            );
          } else {
            showNotification(
              t('organization.registerIRec.notifications.registerError'),
              NotificationTypeEnum.Error
            );
          }
        },
      }
    );
  };
};
