import {
  CreateIrecCertificationRequestDTO,
  useCertificationRequestControllerCreate,
} from '@energyweb/issuer-irec-api-react-query-client';
import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
  UploadedFile,
} from '@energyweb/origin-ui-core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { EnergyFormatter } from '@energyweb/origin-ui-utils';
import { UnpackNestedValue } from 'react-hook-form';
import { useCachedUser } from '../cached';

type FormValuesTypes = {
  fromTime: string;
  toTime: string;
  energy: string;
  irecTradeAccountCode?: string;
};

type TUseRequestCertificatesHandlerArgs = {
  files: UploadedFile[];
  deviceId: string;
  closeForm: () => void;
};

export const useRequestCertificatesHandler = ({
  files,
  deviceId,
  closeForm,
}: TUseRequestCertificatesHandlerArgs) => {
  const { t } = useTranslation();
  const user = useCachedUser();
  const { data, isLoading } = useAccountControllerGetAccount({
    query: {
      staleTime: 1000000,
    },
  });
  const address = data?.address;

  const { mutate, isLoading: isMutating } =
    useCertificationRequestControllerCreate();

  const requestHandler = (values: UnpackNestedValue<FormValuesTypes>) => {
    const parsedEnergy = isNaN(Number(values.energy))
      ? 0
      : Number(values.energy);
    const energyInBaseUnit =
      EnergyFormatter.getBaseValueFromValueInDisplayUnit(parsedEnergy);

    if (!address) {
      showNotification(
        t('device.my.notifications.onlyUsersWithExchangeAddress'),
        NotificationTypeEnum.Error
      );
      throw Error(t('device.my.notifications.onlyUsersWithExchangeAddress'));
    }

    const formattedValues: CreateIrecCertificationRequestDTO = {
      energy: energyInBaseUnit.toString(),
      to:
        user?.organization?.selfOwnership &&
        Boolean(user?.organization?.blockchainAccountAddress)
          ? user?.organization?.blockchainAccountAddress
          : address,
      deviceId: deviceId,
      // Force set timezone to UTC, to ensure that the day of issuance will be precise, and won't
      // be moved to another day if converted to UTC on backend on IREC.
      // This is some kind of workaround, but applicable for current business cases.
      fromTime: dayjs(values.fromTime).startOf('day').utc(true).unix(),
      toTime: dayjs(values.toTime).endOf('day').utc(true).unix(),
      files: files.map((f) => f.uploadedName),
      isPrivate: false,
      irecTradeAccountCode: values.irecTradeAccountCode || undefined,
    };

    mutate(
      { data: formattedValues },
      {
        onSuccess: () => {
          showNotification(
            t('device.my.notifications.certificateRequestSuccess'),
            NotificationTypeEnum.Success
          );
          closeForm();
        },
        onError: (error: any) => {
          if (error?.response?.status === 409) {
            showNotification(
              t('device.my.notifications.certificateRequestAlreadyExists'),
              NotificationTypeEnum.Error
            );
            return;
          }

          showNotification(
            `${t('device.my.notifications.certificateRequestError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { isLoading, isMutating, requestHandler };
};
