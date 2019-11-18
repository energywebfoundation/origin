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

        for (const [region, provinces] of Object.entries(THAILAND_REGIONS_PROVINCES_MAP)) {
            const included = provinces.some(p => p === province);

            if (included) {
                return `${country};${region};${province}`;
            }
        }

        throw new Error('unable to translate address');
    }

    public matches(currentLocation: string[], checkedLocation: string) {
        const highestSpecificityTypes = this.filterForHighestSpecificity(
            currentLocation
        ).map(type => [...this.decode([type])[0]]);

        return highestSpecificityTypes.some(location =>
            checkedLocation.startsWith(this.encode([location])[0])
        );
    }

    public encode(decoded: string[][]): string[] {
        return decoded.map(group => group.join(';'));
    }

    public decode(encoded: string[]): string[][] {
        return encoded.map(item => item.split(';'));
    }

    private clear(input: string) {
        const terms = [['Nakhon Province', 'Nakhon Pathom']];

        return terms.reduce((res, term) => `${res}`.replace(term[0], term[1] || ''), input);
    }

    private filterForHighestSpecificity(types: string[]): string[] {
        const decodedTypes = types.map(type => [...this.decode([type])[0]]);

        return this.encode(
            decodedTypes.filter(
                type =>
                    !decodedTypes.some(
                        nestedType => nestedType[0] === type[0] && type.length < nestedType.length
                    )
            )
        );
    }
}
