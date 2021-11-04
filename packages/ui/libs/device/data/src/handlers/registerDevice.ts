import { useQueryClient } from 'react-query';
import {
  getUserControllerMeQueryKey,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { useDeviceRegistryControllerCreateDevice as useOriginCreateDevice } from '@energyweb/origin-device-registry-api-react-query-client';
import { useDeviceControllerCreateDevice as useIRecCreateDevice } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  decomposeForIRec,
  decomposeForOrigin,
  getCountriesTimeZones,
} from '../utils';
import { TRegisterDeviceFormValues } from '../types';

export const useApiRegisterDevice = (platformCountryCode: string) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate, isLoading: isOriginMutating } = useOriginCreateDevice();
  const { mutateAsync, isLoading: isIRecMutating } = useIRecCreateDevice();
  const userQueryKey = getUserControllerMeQueryKey();
  const queryClient = useQueryClient();
  const user: UserDTO = queryClient.getQueryData(userQueryKey);
  const isMutating = isIRecMutating || isOriginMutating;

  const { moreThanOneTimeZone, countryTimezones } =
    getCountriesTimeZones(platformCountryCode);

  const submitHandler = (values: TRegisterDeviceFormValues) => {
    const iRecCreateData = decomposeForIRec({
      newDevice: values,
      organization: user.organization,
      platformCountryCode,
      moreThanOneTimeZone,
      timeZones: countryTimezones,
    });
    const originCreateData = decomposeForOrigin(values);

    mutateAsync({ data: iRecCreateData })
      .then((createdIRecDevice) => {
        mutate(
          {
            data: {
              ...originCreateData,
              externalRegistryId: createdIRecDevice.id,
            },
          },
          {
            onSuccess: () => {
              showNotification(
                t('device.register.notifications.registerSuccess'),
                NotificationTypeEnum.Success
              );
              navigate('/device/my');
            },
            onError: (error: any) => {
              showNotification(
                `${t('device.register.notifications.registerError')}:
              ${error?.response?.data?.message || ''}
              `,
                NotificationTypeEnum.Error
              );
            },
          }
        );
      })
      .catch((error: AxiosError) => {
        showNotification(
          `${t('device.register.notifications.registerError')}:
        ${error?.response?.data?.message || ''}
        `,
          NotificationTypeEnum.Error
        );
      });
  };

  return { submitHandler, isMutating };
};
