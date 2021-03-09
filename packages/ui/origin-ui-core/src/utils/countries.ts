import { Countries } from '@energyweb/utils-general';

export const getCountryCodeFromId = (code: string): string =>
    Countries.find((country) => country.code === code)?.code;
