import { LocationService } from '../blockchain-facade/LocationService';
import { assert } from 'chai';

describe('LocationService tests', () => {
    it('should translate existing asset locations', () => {
        const address =
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140';

        const expectedRegion = 'Central';
        const expectedProvince = 'Nakhon Pathom';
        const expectedCountry = 'Thailand';
        const expected = `${expectedCountry};${expectedRegion};${expectedProvince}`;

        const result = new LocationService().translateAddress(address, expectedCountry);
        assert.equal(result, expected);
    });

    it('should translate based on province only', () => {
        const address = 'Nakhon Province 73140';

        const expectedRegion = 'Central';
        const expectedProvince = 'Nakhon Pathom';
        const expectedCountry = 'Thailand';
        const expected = `${expectedCountry};${expectedRegion};${expectedProvince}`;

        const result = new LocationService().translateAddress(address, expectedCountry);
        assert.equal(result, expected);
    });
});
