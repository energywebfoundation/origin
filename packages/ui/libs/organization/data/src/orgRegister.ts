import {
  fileControllerUpload,
  getUserControllerMeQueryKey,
  NewOrganizationDTO,
  useOrganizationControllerRegister,
} from '@energyweb/origin-backend-react-query-client';
import {
  FormSelectOption,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

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
  const queryClient = useQueryClient();

  const { mutate } = useOrganizationControllerRegister();
  const userKey = getUserControllerMeQueryKey();

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
          queryClient.invalidateQueries(userKey);
          openRoleChangedModal();
        },
        onError: (error: AxiosError) => {
          console.warn('Error while registering an organization', error);

          if (error?.response?.status === 401) {
            showNotification(
              t('organization.register.notifications.unauthorized'),
              NotificationTypeEnum.Error
            );
          } else if (error?.response?.status === 400) {
            openAlreadyExistsModal();
            showNotification(
              error?.response?.data?.message,
              NotificationTypeEnum.Error
            );
          } else {
            showNotification(
              t('organization.register.notifications.registeredFailure'),
              NotificationTypeEnum.Error
            );
          }
        },
      }
    );
  };

  return registerHandler;
};

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
