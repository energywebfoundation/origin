import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  ComposedDevice,
  useDeviceFirstImageUrl,
} from '@energyweb/origin-ui-device-data';
import { useSpecsForMyDeviceCard } from '@energyweb/origin-ui-device-logic';

export const useMyDeviceCardEffects = (
  device: ComposedDevice,
  allTypes: CodeNameDTO[]
) => {
  const imageUrl = useDeviceFirstImageUrl(device.imageIds);

  const cardProps = useSpecsForMyDeviceCard({ device, allTypes, imageUrl });

  return cardProps;
};
