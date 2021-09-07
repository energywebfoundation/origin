import { ReadDTO } from '@energyweb/origin-energy-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { useSmartMeterTableLogic } from '@energyweb/origin-ui-device-logic';

export const useSmartMeterTableEffects = (device: ComposedPublicDevice) => {
  // @should connect to actual readings api
  const reads: ReadDTO[] = [];

  const tableProps = useSmartMeterTableLogic({
    device,
    reads,
    loading: false,
  });

  return tableProps;
};
