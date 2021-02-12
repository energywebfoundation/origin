import { assert } from 'chai';
import { LocationService } from '../blockchain-facade/LocationService';

describe('LocationService tests', () => {
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
                    new LocationService().matches(deviceTypes as string[], typeToCheck as string),
                    expectedResult
                );
            }
        });
    });
});
