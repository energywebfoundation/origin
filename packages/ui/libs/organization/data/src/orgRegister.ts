import {
  fileControllerUpload,
  NewOrganizationDTO,
  useOrganizationControllerRegister,
} from '@energyweb/origin-backend-react-query-client';
import {
  GenericFormProps,
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useOrganizationRegisterHandler = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate } = useOrganizationControllerRegister();

  const registerHandler: GenericFormProps<NewOrganizationDTO>['submitHandler'] = (
    values,
    reset
  ) => {
    mutate(
      { data: values },
      {
        onSuccess: () => {
          showNotification(
            t('organization.register.notifications.registeredSuccess'),
            NotificationTypeEnum.Success
          );
          reset();
          navigate('/my');
        },
        onError: (error) => {
          console.log(error);
          showNotification(
            t('organization.register.notifications.registeredFailure'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return registerHandler;
};

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
