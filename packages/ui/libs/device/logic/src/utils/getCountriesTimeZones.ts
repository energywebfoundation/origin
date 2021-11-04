import { TimeZones } from '@energyweb/utils-general';
import { uniqBy } from 'lodash';

export const getCountriesTimeZones = (platformCountryCode: string) => {
  const countryTimezones = uniqBy(
    TimeZones.filter(
      (timezone) => timezone.countryCode === platformCountryCode
    ),
    'utcOffset'
  );
  const moreThanOneTimeZone = countryTimezones.length > 1;

  return { countryTimezones, moreThanOneTimeZone };
};
