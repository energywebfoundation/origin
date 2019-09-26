import { assert } from 'chai';
import { IRECAssetService } from '../blockchain-facade/AssetTypeService';

describe('AssetTypeService tests', () => {
    const assetTypeService = new IRECAssetService();

    it('should return asset type structure', () => {
        assert.isNotNull(assetTypeService.AssetTypes);
    });

    it('should encode asset types', () => {
        const encoded = assetTypeService.encode([
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ]);

        const expectedResult = ['Solar;Concentration', 'Wind;Offshore', 'Marine;Tidal;Inshore'];

        assert.deepEqual(encoded, expectedResult);
    });

    it('should decode asset types', () => {
        const decoded = assetTypeService.decode([
            'Solar;Concentration',
            'Wind;Offshore',
            'Marine;Tidal;Inshore'
        ]);

        const expectedResult = [
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ];

        assert.deepEqual(decoded, expectedResult);
    });

    it('should decode asset types', () => {
        const decoded = assetTypeService.decode([
            'Solar;Concentration',
            'Wind;Offshore',
            'Marine;Tidal;Inshore'
        ]);

        const expectedResult = [
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ];

        assert.deepEqual(decoded, expectedResult);
    });

    it('should find demanded asset types when types matches', () => {
        const demandAssetTypes = ['Solar;Concentration'];
        const supplyAssetTypes = 'Solar;Concentration';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should find demanded asset types when current has one of matches', () => {
        const demandAssetTypes = ['Solar;Concentration', 'Wind'];
        const supplyAssetTypes = 'Solar;Concentration';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should not find demanded asset types when types matches', () => {
        const demandAssetTypes = ['Solar;Concentration'];
        const supplyAssetTypes = 'Wind;Onshore';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });

    it('should correctly handle cases where level one types are included with deeper types of the same category', () => {
        const TEST_MATRIX = [
            [['Solar'], 'Solar;Photovoltaic;Roof mounted', true],
            [['Marine', 'Marine;Tidal'], 'Marine;Tidal;Inshore', true],
            [['Marine', 'Marine;Tidal', 'Marine;Tidal;Offshore'], 'Marine;Tidal;Inshore', false],
            [['Wind', 'Wind;Onshore'], 'Wind;Onshore', true],
            [['Wind', 'Wind;Onshore', 'Solar'], 'Wind;Onshore', true],
            [['Wind', 'Wind;Onshore'], 'Wind;Offshore', false],
            [['Wind', 'Wind;Onshore', 'Solar;Photovoltaic'], 'Wind;Offshore', false],
            [['Wind', 'Wind;Onshore', 'Wind;Offshore'], 'Wind', true],
            [['Wind;Onshore', 'Wind;Offshore'], 'Wind', false],
            [['Marine', 'Marine;Tidal'], 'Marine', true]
        ];

        for (const [assetTypes, typeToCheck, expectedResult] of TEST_MATRIX) {
            assert.equal(
                assetTypeService.includesAssetType(typeToCheck as string, assetTypes as string[]),
                expectedResult
            );
        }
    });

    it('should find demanded asset types when demanded assets are less specific than current', () => {
        const demandAssetTypes = ['Solar'];
        const supplyAssetTypes = 'Solar;Photovoltaic';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should not find demanded asset types when demanded assets are more specific than current', () => {
        const demandAssetTypes = ['Marine;Tidal;Inshore'];
        const supplyAssetTypes = 'Marine;Tidal';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });

    it('should not find demanded asset types when demanded assets are more specific than current', () => {
        const demandAssetTypes = ['Marine;Tidal;Inshore'];
        const supplyAssetTypes = 'Marine;Tidal';

        const res = assetTypeService.includesAssetType(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });

    describe('filterForHighestSpecificity()', () => {
        it('returns an empty array when empty array passed', () => {
            assert.deepEqual(assetTypeService.filterForHighestSpecificity([]), []);
        });

        it('should preserve level level 1 types if no higher specificity', () => {
            const TEST_MATRIX = [
                [['Wind', 'Solar', 'Marine'], ['Wind', 'Solar', 'Marine']],
                [['Liquid'], ['Liquid']]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    assetTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('correctly filters out level 1 types if level 2 types of the same category are present', () => {
            const TEST_MATRIX = [
                [['Solar', 'Solar;Photovoltaic'], ['Solar;Photovoltaic']],
                [['Solar', 'Solar;Photovoltaic', 'Wind'], ['Solar;Photovoltaic', 'Wind']],
                [
                    ['Solar', 'Solar;Photovoltaic', 'Wind', 'Wind;Onshore'],
                    ['Solar;Photovoltaic', 'Wind;Onshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    assetTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('should preserve level 2 types if level 1 type of the same category is not present', () => {
            const TEST_MATRIX = [
                [['Wind;Offshore', 'Wind;Onshore'], ['Wind;Offshore', 'Wind;Onshore']],
                [
                    ['Solar', 'Solar;Photovoltaic', 'Wind;Offshore', 'Wind;Onshore'],
                    ['Solar;Photovoltaic', 'Wind;Offshore', 'Wind;Onshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    assetTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('correctly filters out level 1 and 2 types if level 3 types of the same category are present', () => {
            const TEST_MATRIX = [
                [
                    ['Solar', 'Solar;Photovoltaic', 'Solar;Photovoltaic;Roof mounted'],
                    ['Solar;Photovoltaic;Roof mounted']
                ],
                [
                    [
                        'Solar',
                        'Solar;Photovoltaic',
                        'Solar;Photovoltaic;Roof mounted',
                        'Marine',
                        'Marine;Tidal',
                        'Marine;Tidal;Inshore'
                    ],
                    ['Solar;Photovoltaic;Roof mounted', 'Marine;Tidal;Inshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    assetTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('should preserve level 3 types if level 2 type of the same category is not present', () => {
            const TEST_MATRIX = [
                [['Solar;Photovoltaic;Roof mounted'], ['Solar;Photovoltaic;Roof mounted']],
                [
                    ['Solar;Photovoltaic;Roof mounted', 'Marine;Tidal;Inshore'],
                    ['Solar;Photovoltaic;Roof mounted', 'Marine;Tidal;Inshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    assetTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });
    });
});
