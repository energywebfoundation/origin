import { assert } from 'chai';
import { LocationService } from '../utils/LocationService';

describe('LocationService tests', () => {
    const expectedRegion = 'Central';
    const expectedProvince = 'Nakhon Pathom';
    const expectedCountry = 'Thailand';
    const expected = `${expectedCountry};${expectedRegion};${expectedProvince}`;

    const locationService = new LocationService(expectedCountry, { [expectedRegion]: [ expectedProvince ] });    

    it('should translate existing device locations', () => {
        const address =
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140';

        const expected = `${expectedCountry};${expectedRegion};${expectedProvince}`;

        const result = locationService.translateAddress(address);
        assert.equal(result, expected);
    });

    it('should translate based on province only', () => {
        const address = 'Nakhon Province 73140';

        const result = locationService.translateAddress(address);
        assert.equal(result, expected);
    });

    describe('matches()', () => {
        it('correctly matches cases with different specificity', () => {
            const TEST_MATRIX = [
                [['Thailand;South'], 'Thailand;South;Phuket', true],
                [['Thailand', 'Thailand;South'], 'Thailand;South;Inshore', true],
                [
                    ['Thailand', 'Thailand;South', 'Thailand;South;Phuket'],
                    'Thailand;South;Krabi',
                    false
                ],
                [['Thailand', 'Thailand;South'], 'Thailand;South', true],
                [['Thailand', 'Thailand;South', 'Thailand;East'], 'Thailand;South', true],
                [['Thailand', 'Thailand;South'], 'Thailand;East', false],
                [['Thailand', 'Thailand;South', 'Thailand;North'], 'Thailand;East', false],
                [['Thailand', 'Thailand;South', 'Thailand;East'], 'Thailand', false]
            ];

            for (const [deviceTypes, typeToCheck, expectedResult] of TEST_MATRIX) {
                assert.equal(
                    locationService.matches(deviceTypes as string[], typeToCheck as string),
                    expectedResult
                );
            }
        });
    });
});
