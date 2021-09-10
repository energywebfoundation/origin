import { Countries } from '@energyweb/utils-general';

export const COUNTRY_OPTIONS_ISO = Countries.map((country) => ({
  value: country.code,
  label: country.name,
}));
