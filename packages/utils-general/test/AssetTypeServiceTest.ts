import { IRECAssetService } from '../src/blockchain-facade/AssetTypeService';
import { assert } from 'chai';

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
        const decoded = assetTypeService.decode(['Solar;Concentration', 'Wind;Offshore', 'Marine;Tidal;Inshore']);

        const expectedResult = [
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ];

        assert.deepEqual(decoded, expectedResult);
    });

    it('should decode asset types', () => {
        const decoded = assetTypeService.decode(['Solar;Concentration', 'Wind;Offshore', 'Marine;Tidal;Inshore']);

        const expectedResult = [
            ['Solar', 'Concentration'],
            ['Wind', 'Offshore'],
            ['Marine', 'Tidal', 'Inshore']
        ];

        assert.deepEqual(decoded, expectedResult);
    });

    it('should find demanded asset types when types matches', () => {
        const demandAssetTypes = ['Solar;Concentration'];
        const supplyAssetTypes = ['Solar;Concentration'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should find demanded asset types when current has one of matches', () => {
        const demandAssetTypes = ['Solar;Concentration', 'Wind'];
        const supplyAssetTypes = ['Solar;Concentration'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should not find demanded asset types when types matches', () => {
        const demandAssetTypes = ['Solar;Concentration'];
        const supplyAssetTypes = ['Wind;Onshore'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });

    it('should find demanded asset types when demanded assets are less specific than current', () => {
        const demandAssetTypes = ['Solar'];
        const supplyAssetTypes = ['Solar;Photovoltaic;Roof mounted'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isTrue(res);
    });

    it('should not find demanded asset types when demanded assets are more specific than current', () => {
        const demandAssetTypes = ['Marine;Tidal;Inshore'];
        const supplyAssetTypes = ['Marine;Tidal'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });

    it('should not find demanded asset types when demanded assets are more specific than current', () => {
        const demandAssetTypes = ['Marine;Tidal;Inshore'];
        const supplyAssetTypes = ['Marine;Tidal'];

        const res = assetTypeService.includes(supplyAssetTypes, demandAssetTypes);
        assert.isFalse(res);
    });
});
