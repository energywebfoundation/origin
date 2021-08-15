import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';
import { useSmartMeterTableLogic } from '@energyweb/origin-ui-device-logic';
import { smartMeterReadingsMock } from '../../../__mocks__/smartMeterReadingsMock';

export const useSmartMeterTableEffects = (device: ComposedPublicDevice) => {
  const reads =
    smartMeterReadingsMock[
      device.smartMeterId as keyof typeof smartMeterReadingsMock
    ];

  const tableProps = useSmartMeterTableLogic({
    device,
    reads,
    loading: false,
  });

  return tableProps;
};
