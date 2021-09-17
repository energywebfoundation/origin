import {
  NewOrganizationDTO,
  useOrganizationControllerRegister,
} from '@energyweb/origin-backend-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

interface IUseOrganizationRegisterHandlerProps {
  openRoleChangedModal: () => void;
  openAlreadyExistsModal: () => void;
}

type OrgRegisterFormValues = Omit<
  NewOrganizationDTO,
  'country' | 'signatoryCountry'
> & {
  country: FormSelectOption[];
  signatoryCountry: FormSelectOption[];
};

export const useOrganizationRegisterHandler = ({
  openRoleChangedModal,
  openAlreadyExistsModal,
}: IUseOrganizationRegisterHandlerProps) => {
  const { t } = useTranslation();

  const { mutate } = useOrganizationControllerRegister();

  const registerHandler = (values: OrgRegisterFormValues) => {
    const formattedValues: NewOrganizationDTO = {
      ...values,
      country: values.country[0].value as string,
      signatoryCountry: values.signatoryCountry[0].value as string,
    };
    mutate(
      { data: formattedValues },
      {
        onSuccess: () => {
          showNotification(
            t('organization.register.notifications.registeredSuccess'),
            NotificationTypeEnum.Success
          );
          openRoleChangedModal();
        },
        onError: (error: any) => {
          if (error?.response?.status === 400) {
            openAlreadyExistsModal();
            showNotification(
              error?.response?.data?.message,
              NotificationTypeEnum.Error
            );
          } else {
            showNotification(
              `${t('organization.register.notifications.registeredFailure')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          }
        },
      }
    );
  };

  return registerHandler;
};
