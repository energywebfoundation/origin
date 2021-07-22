import { Countries } from '@energyweb/utils-general';

export const getCountryName = (code: string): string =>
  Countries.find((country) => country.code === code)?.name;
