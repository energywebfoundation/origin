import { ReadingsWindowEnum } from '@energyweb/origin-ui-device-data';
import { OpUnitType } from 'dayjs';

export const getTimeUnitOnWindow = (window: ReadingsWindowEnum): OpUnitType => {
  switch (window) {
    case ReadingsWindowEnum.Day:
      return 'day';
    case ReadingsWindowEnum.Week:
      return 'week';
    case ReadingsWindowEnum.Month:
      return 'month';
    case ReadingsWindowEnum.Year:
      return 'year';
  }
};
