import {
  getIrecCertificateControllerGetIrecCertificateToImportQueryKey,
  IrecAccountItemDto,
  useIrecCertificateControllerImportIrecCertificate,
} from '@energyweb/issuer-irec-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useImportCertificateHandler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const certificatesToImportQueryKey =
    getIrecCertificateControllerGetIrecCertificateToImportQueryKey();

  const { mutate } = useIrecCertificateControllerImportIrecCertificate();

  const submitHandler = (assetId: IrecAccountItemDto['asset']) => {
    mutate(
      { data: { assetId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(certificatesToImportQueryKey);
          showNotification(
            t('certificate.import.notifications.importSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.import.notifications.importError')}:
          ${error?.response?.data?.message || ''} `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { submitHandler };
};
