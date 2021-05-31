import {
  CreateCertificationRequestDTO,
  useCertificationRequestControllerCreate,
} from '@energyweb/issuer-api-react-query-client';
import { useAccountControllerGetAccount } from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
  UploadedFile,
} from '@energyweb/origin-ui-core';
import { fileControllerUpload } from '@energyweb/origin-backend-react-query-client';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { EnergyFormatter } from '@energyweb/origin-ui-utils';

type FormValuesTypes = {
  fromTime: string;
  toTime: string;
  energy: string;
};

type TUseRequestCertificatesHandlerArgs = {
  files: UploadedFile[];
  deviceId: string;
};

export const useRequestCertificatesHandler = ({
  files,
  deviceId,
}: TUseRequestCertificatesHandlerArgs) => {
  const { t } = useTranslation();
  const { data, isLoading } = useAccountControllerGetAccount({
    staleTime: 100000,
  });
  const address = data?.address;

  const { mutate } = useCertificationRequestControllerCreate();

  const requestHandler = (values: FormValuesTypes) => {
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
      fromTime: dayjs(values.fromTime).unix(),
      toTime: dayjs(values.toTime).unix(),
      files: files.map((f) => f.uploadedName),
      isPrivate: false,
    };
    mutate({ data: formattedValues });
  };

  return { isLoading, requestHandler };
};

export const fileUploadHandler = async (file: Blob[]) => {
  return await fileControllerUpload({ files: file });
};
