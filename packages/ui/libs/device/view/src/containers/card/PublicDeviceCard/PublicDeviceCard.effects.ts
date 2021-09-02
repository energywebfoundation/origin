import { useSpecsForAllDeviceCard } from '@energyweb/origin-ui-device-logic';

import {
  ComposedPublicDevice,
  useDeviceFirstImageUrl,
} from '@energyweb/origin-ui-device-data';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useNavigate } from 'react-router';

type TUsePublicDeviceCardEffectsArgs = {
  device: ComposedPublicDevice;
  allDeviceTypes: CodeNameDTO[];
};

export const usePublicDeviceCardEffects = ({
  device,
  allDeviceTypes,
}: TUsePublicDeviceCardEffectsArgs) => {
  const navigate = useNavigate();

  const imageUrl = useDeviceFirstImageUrl(device.imageIds);

  const viewDetailsClickHandler = (link: string) => navigate(link);

  const { specsData, iconsData, cardProps } = useSpecsForAllDeviceCard({
    device,
    allTypes: allDeviceTypes,
    clickHandler: viewDetailsClickHandler,
    imageUrl,
  });

  return { specsData, iconsData, cardProps };
};
