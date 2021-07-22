import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';
import { useSpecsForMyDeviceCard } from '@energyweb/origin-ui-device-logic';

export const useMyDeviceCardEffects = (
  device: ComposedDevice,
  allTypes: CodeNameDTO[]
) => {
  const cardProps = useSpecsForMyDeviceCard({ device, allTypes });

  return cardProps;
};
