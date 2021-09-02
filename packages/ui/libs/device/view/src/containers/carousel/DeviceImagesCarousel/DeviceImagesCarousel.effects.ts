import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  ComposedDevice,
  ComposedPublicDevice,
  useDeviceImageUrls,
} from '@energyweb/origin-ui-device-data';
import {
  getEnergyTypeImage,
  getMainFuelType,
} from '@energyweb/origin-ui-device-logic';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';

export const useDeviceImagesCarouselEffects = (
  imageIds: ComposedDevice['imageIds'],
  fuelType: ComposedPublicDevice['fuelType'],
  allFuelTypes: CodeNameDTO[]
) => {
  const imageUrls = useDeviceImageUrls(imageIds);

  const { mainType } = getMainFuelType(fuelType, allFuelTypes);
  const FallbackIcon = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum,
    true
  );

  return { FallbackIcon, imageUrls };
};
