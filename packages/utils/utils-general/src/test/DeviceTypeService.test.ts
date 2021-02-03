import { assert } from 'chai';
import { DeviceTypeService } from '../blockchain-facade/DeviceTypeService';

describe('DeviceTypeService tests', () => {
    const deviceTypeService = new DeviceTypeService([
        ['Solar'],
        ['Solar', 'Photovoltaic'],
        ['Solar', 'Photovoltaic', 'Roof mounted'],
        ['Solar', 'Photovoltaic', 'Ground mounted'],
        ['Solar', 'Photovoltaic', 'Classic silicon'],
        ['Solar', 'Concentration'],
        ['Wind'],
        ['Wind', 'Onshore'],
        ['Wind', 'Offshore'],
        ['Marine'],
        ['Marine', 'Tidal'],
        ['Marine', 'Tidal', 'Inshore'],
        ['Marine', 'Tidal', 'Offshore'],
        ['Marine', 'Wave'],
        ['Marine', 'Wave', 'Onshore'],
        ['Marine', 'Wave', 'Offshore'],
        ['Marine', 'Currents'],
        ['Marine', 'Pressure'],
        ['Marine', 'Thermal'],
        ['Liquid'],
        ['Thermal']
    ]);

    it('should return device type structure', () => {
        assert.isNotNull(deviceTypeService.deviceTypes);
    });

    it('should encode device types', () => {
        const encoded = deviceTypeService.encode([
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ]);

        const expectedResult = ['Solar;Concentration', 'Wind;Offshore', 'Marine;Tidal;Inshore'];

        assert.deepEqual(encoded, expectedResult);
    });

    describe('includesDeviceType()', () => {
        it('should decode device types', () => {
            const decoded = deviceTypeService.decode([
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

        it('should decode device types', () => {
            const decoded = deviceTypeService.decode([
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

        it('should find demanded device types when types matches', () => {
            const demandDeviceTypes = ['Solar;Concentration'];
            const supplyDeviceTypes = 'Solar;Concentration';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isTrue(res);
        });

        it('should find demanded device types when current has one of matches', () => {
            const demandDeviceTypes = ['Solar;Concentration', 'Wind'];
            const supplyDeviceTypes = 'Solar;Concentration';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isTrue(res);
        });

        it('should not find demanded device types when types matches', () => {
            const demandDeviceTypes = ['Solar;Concentration'];
            const supplyDeviceTypes = 'Wind;Onshore';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isFalse(res);
        });

        it('should correctly handle cases where level one types are included with deeper types of the same category', () => {
            const TEST_MATRIX = [
                [['Solar'], 'Solar;Photovoltaic;Roof mounted', true],
                [['Marine', 'Marine;Tidal'], 'Marine;Tidal;Inshore', true],
                [
                    ['Marine', 'Marine;Tidal', 'Marine;Tidal;Offshore'],
                    'Marine;Tidal;Inshore',
                    false
                ],
                [['Wind', 'Wind;Onshore'], 'Wind;Onshore', true],
                [['Wind', 'Wind;Onshore', 'Solar'], 'Wind;Onshore', true],
                [['Wind', 'Wind;Onshore'], 'Wind;Offshore', false],
                [['Wind', 'Wind;Onshore', 'Solar;Photovoltaic'], 'Wind;Offshore', false],
                [['Wind', 'Wind;Onshore', 'Wind;Offshore'], 'Wind', false],
                [['Wind;Onshore', 'Wind;Offshore'], 'Wind', false],
                [['Marine', 'Marine;Tidal'], 'Marine', false]
            ];

            for (const [deviceTypes, typeToCheck, expectedResult] of TEST_MATRIX) {
                assert.equal(
                    deviceTypeService.includesDeviceType(
                        typeToCheck as string,
                        deviceTypes as string[]
                    ),
                    expectedResult
                );
            }
        });

        it('should find demanded device types when demanded devices are less specific than current', () => {
            const demandDeviceTypes = ['Solar'];
            const supplyDeviceTypes = 'Solar;Photovoltaic;Roof mounted';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isTrue(res);
        });

        it('should not find demanded device types when demanded devices are more specific than current', () => {
            const demandDeviceTypes = ['Marine;Tidal;Inshore'];
            const supplyDeviceTypes = 'Marine;Tidal';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isFalse(res);
        });

        it('should not find demanded device types when demanded devices are more specific than current', () => {
            const demandDeviceTypes = ['Marine;Tidal;Inshore'];
            const supplyDeviceTypes = 'Marine;Tidal';

            const res = deviceTypeService.includesDeviceType(supplyDeviceTypes, demandDeviceTypes);
            assert.isFalse(res);
        });
    });

    describe('includesDeviceTypeMany', () => {
        it('should find demanded device types when types matches', () => {
            const demandDeviceTypes = ['Solar;Concentration'];
            const supplyDeviceTypes = ['Solar;Concentration'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isTrue(res);
        });

        it('should find demanded device types when current has one of matches', () => {
            const demandDeviceTypes = ['Solar;Concentration', 'Wind'];
            const supplyDeviceTypes = ['Solar;Concentration'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isTrue(res);
        });

        it('should not find demanded device types when types matches', () => {
            const demandDeviceTypes = ['Solar;Concentration'];
            const supplyDeviceTypes = ['Wind;Onshore'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isFalse(res);
        });

        it('should correctly handle cases where level one types are included with deeper types of the same category', () => {
            const TEST_MATRIX = [
                [['Solar'], ['Solar;Photovoltaic;Roof mounted', 'Wind'], true],
                [['Marine', 'Marine;Tidal'], ['Marine;Tidal;Inshore', 'Solar'], true],
                [
                    ['Marine', 'Marine;Tidal', 'Marine;Tidal;Offshore'],
                    ['Marine;Tidal;Inshore'],
                    false
                ],
                [['Wind', 'Wind;Onshore'], ['Wind;Onshore'], true],
                [['Wind', 'Wind;Onshore', 'Solar'], ['Wind;Onshore'], true],
                [['Wind', 'Wind;Onshore'], ['Wind;Offshore'], false],
                [
                    ['Wind', 'Wind;Onshore', 'Solar;Photovoltaic'],
                    ['Wind;Offshore', 'Marine'],
                    false
                ],
                [['Wind', 'Wind;Onshore', 'Wind;Offshore'], ['Wind', 'Solar'], false],
                [['Wind;Onshore', 'Wind;Offshore'], ['Wind', 'Solar'], false],
                [['Marine', 'Marine;Tidal'], ['Marine', 'Solar'], false]
            ];

            for (const [deviceTypes, typeToCheck, expectedResult] of TEST_MATRIX) {
                assert.equal(
                    deviceTypeService.includesSomeDeviceType(
                        typeToCheck as string[],
                        deviceTypes as string[]
                    ),
                    expectedResult
                );
            }
        });

        it('should find demanded device types when demanded devices are less specific than current', () => {
            const demandDeviceTypes = ['Solar'];
            const supplyDeviceTypes = ['Solar;Photovoltaic;Roof mounted'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isTrue(res);
        });

        it('should not find demanded device types when demanded devices are more specific than current', () => {
            const demandDeviceTypes = ['Marine;Tidal;Inshore'];
            const supplyDeviceTypes = ['Marine;Tidal'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isFalse(res);
        });

        it('should not find demanded device types when demanded devices are more specific than current', () => {
            const demandDeviceTypes = ['Marine;Tidal;Inshore'];
            const supplyDeviceTypes = ['Marine;Tidal'];

            const res = deviceTypeService.includesSomeDeviceType(
                supplyDeviceTypes,
                demandDeviceTypes
            );
            assert.isFalse(res);
        });
    });

    describe('filterForHighestSpecificity()', () => {
        it('returns an empty array when empty array passed', () => {
            assert.deepEqual(deviceTypeService.filterForHighestSpecificity([]), []);
        });

        it('should preserve level level 1 types if no higher specificity', () => {
            const TEST_MATRIX = [
                [
                    ['Wind', 'Solar', 'Marine'],
                    ['Wind', 'Solar', 'Marine']
                ],
                [['Liquid'], ['Liquid']]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    deviceTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('correctly filters out level 1 types if level 2 types of the same category are present', () => {
            const TEST_MATRIX = [
                [['Solar', 'Solar;Photovoltaic'], ['Solar;Photovoltaic']],
                [
                    ['Solar', 'Solar;Photovoltaic', 'Wind'],
                    ['Solar;Photovoltaic', 'Wind']
                ],
                [
                    ['Solar', 'Solar;Photovoltaic', 'Wind', 'Wind;Onshore'],
                    ['Solar;Photovoltaic', 'Wind;Onshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    deviceTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });

        it('should preserve level 2 types if level 1 type of the same category is not present', () => {
            const TEST_MATRIX = [
                [
                    ['Wind;Offshore', 'Wind;Onshore'],
                    ['Wind;Offshore', 'Wind;Onshore']
                ],
                [
                    ['Solar', 'Solar;Photovoltaic', 'Wind;Offshore', 'Wind;Onshore'],
                    ['Solar;Photovoltaic', 'Wind;Offshore', 'Wind;Onshore']
                ]
            ];

            for (const [unfiltered, expectedFiltered] of TEST_MATRIX) {
                assert.deepEqual(
                    deviceTypeService.filterForHighestSpecificity(unfiltered),
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
                    deviceTypeService.filterForHighestSpecificity(unfiltered),
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
                    deviceTypeService.filterForHighestSpecificity(unfiltered),
                    expectedFiltered
                );
            }
        });
    });
});
