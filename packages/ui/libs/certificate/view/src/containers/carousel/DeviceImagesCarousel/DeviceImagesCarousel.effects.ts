import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import {
  getEnergyTypeImage,
  getMainFuelType,
} from '@energyweb/origin-ui-device-logic';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';

export const useDeviceImagesCarouselEffects = (
  fuelType: ComposedPublicDevice['fuelType'],
  allFuelTypes: CodeNameDTO[]
) => {
  const { mainType } = getMainFuelType(fuelType, allFuelTypes);
  const FallbackIcon = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum,
    true
  );

  return FallbackIcon;
};
