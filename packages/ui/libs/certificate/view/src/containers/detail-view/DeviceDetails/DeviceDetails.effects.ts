import {
  ComposedPublicDevice,
  useAllFuelTypes,
  useCertifiedAmountForDevice,
} from '@energyweb/origin-ui-certificate-data';
import { useDeviceDetailsLogic } from '@energyweb/origin-ui-certificate-logic';

export const useDetailViewPageEffects = (device: ComposedPublicDevice) => {
  const { certifiedAmount, isCertifiedLoading } = useCertifiedAmountForDevice(
    device.externalRegistryId
  );
  const { allTypes, isLoading: areFuelTypesLoading } = useAllFuelTypes();

  const { locationProps, cardProps } = useDeviceDetailsLogic({
    device,
    owner: device.ownerId,
    allTypes,
    certifiedAmount,
  });

  const isLoading = areFuelTypesLoading || isCertifiedLoading;

  return { locationProps, cardProps, isLoading, allTypes };
};
