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
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
          navigate('/organization/my');
          showNotification(
            t('organization.register.notifications.registeredSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(userKey);
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

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
