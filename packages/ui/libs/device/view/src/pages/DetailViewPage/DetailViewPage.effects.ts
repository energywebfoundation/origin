import {
  useAllDeviceFuelTypes,
  useDeviceDetailData,
} from '@energyweb/origin-ui-device-data';
import { useDeviceDetailViewLogic } from '@energyweb/origin-ui-device-logic';
import { useParams } from 'react-router';

export const useDetailViewPageEffects = () => {
  const { id } = useParams();

  const {
    device,
    isLoading: isDeviceLoading,
    certifiedAmount,
  } = useDeviceDetailData(id);

  const { allTypes, isLoading: isDeviceTypesLoading } = useAllDeviceFuelTypes();
  const { locationProps, cardProps } = useDeviceDetailViewLogic({
    device,
    owner: device.ownerId,
    allTypes,
    certifiedAmount,
  });

  const isLoading = isDeviceLoading || isDeviceTypesLoading;

  return { locationProps, cardProps, device, isLoading, allTypes };
};
