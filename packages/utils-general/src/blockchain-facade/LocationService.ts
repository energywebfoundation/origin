import { THAILAND_REGIONS_PROVINCES_MAP } from './Location';

export class LocationService {
    public translateAddress(address: string, country: string) {
        if (country !== 'Thailand') {
            throw new Error('Not implemented');
        }

        const clean = this.clear(address);

        const zipRegex = /[0-9]{5}/;
        const split = clean.split(',').reverse();
        const provinceWithZip = split[0];

        const matchZipResult = provinceWithZip.match(zipRegex);
        const zip = matchZipResult ? matchZipResult[0].trim() : '';

        const province = zip ? (provinceWithZip.split(zipRegex)[0] || '').trim() : '';

        for (const region in THAILAND_REGIONS_PROVINCES_MAP) {
            const provinces = (THAILAND_REGIONS_PROVINCES_MAP as any)[region] as string[];
            const included = provinces.some(p => p == province);

            if (included) {
                return `${country};${region};${province}`;
            }
        }

        throw new Error('unable to translate address');
    }

    public matches(currentLocation: string[], requestedLocation: string) {
        return currentLocation.some(location => location.includes(requestedLocation));
    }

    private clear(input: string) {
        const terms = [['Nakhon Province', 'Nakhon Pathom']];

        return terms.reduce((res, term) => `${res}`.replace(term[0], term[1] || ''), input);
    }
}
