import { assert } from 'chai';
import { LocationService } from '../blockchain-facade/LocationService';

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

            for (const [assetTypes, typeToCheck, expectedResult] of TEST_MATRIX) {
                assert.equal(
                    new LocationService().matches(assetTypes as string[], typeToCheck as string),
                    expectedResult
                );
            }
        });
    });
});
