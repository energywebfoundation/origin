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
import { TRegisterDeviceFormValues } from './types';
import { decomposeForIRec, decomposeForOrigin } from './utils';

export const useApiRegisterDevice = () => {
  const { mutate } = useOriginCreateDevice();
  const { mutateAsync } = useIRecCreateDevice();
  const userQueryKey = getUserControllerMeQueryKey();
  const queryClient = useQueryClient();
  const user: UserDTO = queryClient.getQueryData(userQueryKey);

  return (values: TRegisterDeviceFormValues) => {
    const iRecCreateData = decomposeForIRec(values, user.organization);
    const originCreateData = decomposeForOrigin(values);

    mutateAsync({ data: iRecCreateData }).then((createdIRecDevice) => {
      mutate(
        {
          data: {
            ...originCreateData,
            externalRegistryId: createdIRecDevice.id,
          },
        },
        {
          onSuccess: () => {
            // @should localize
            showNotification(
              `New device successfully created.`,
              NotificationTypeEnum.Success
            );
          },
        }
      );
    });
  };
};
