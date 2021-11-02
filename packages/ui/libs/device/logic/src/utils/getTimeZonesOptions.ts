import { TimeZone } from '@energyweb/utils-general';

export const getTimeZonesOptions = (countryTimeZones: TimeZone[]) => {
  return countryTimeZones.map((item) => ({
    value: item.timeZone,
    label: item.timeZone,
  }));
};
