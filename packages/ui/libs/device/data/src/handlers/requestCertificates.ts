import {
  CreateCertificationRequestDTO,
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

type FormValuesTypes = {
  fromTime: string;
  toTime: string;
  energy: string;
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
  const { data, isLoading } = useAccountControllerGetAccount({
    staleTime: 100000,
  });
  const address = data?.address;

  const { mutate } = useCertificationRequestControllerCreate();

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

    const formattedValues: CreateCertificationRequestDTO = {
      energy: energyInBaseUnit.toString(),
      to: !isLoading && address,
      deviceId: deviceId,
      fromTime: dayjs(values.fromTime).startOf('day').unix(),
      toTime: dayjs(values.toTime).endOf('day').unix(),
      files: files.map((f) => f.uploadedName),
      isPrivate: false,
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
          if (error.response.status === 409) {
            showNotification(
              t('device.my.notifications.certificateRequestAlreadyExists'),
              NotificationTypeEnum.Error
            );
            return;
          }

          showNotification(
            t('device.my.notifications.certificateRequestError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { isLoading, requestHandler };
};
