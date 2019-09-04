import { IRECAssetService, AssetType } from '../src/blockchain-facade/AssetTypeService';
import { assert } from 'chai';

describe('AssetTypeService tests', () => {
    it('should return asset type structure', () => {
        const assetTypeService = new IRECAssetService();

        assert.isNotNull(assetTypeService.AssetTypes);
    });

    it('should encode multiple flags', () => {
        const assetTypeService = new IRECAssetService();

        const encoded = assetTypeService.encode(['Solar', 'Concentration']);

        const expectedResult = AssetType.Solar | AssetType.Concentration;

        assert.equal(encoded, expectedResult);
        assert.isTrue((encoded & AssetType.Solar) === AssetType.Solar);
        assert.isFalse((encoded & AssetType.Wind) === AssetType.Wind);
    });

    it('should recognize encoded flags', () => {
        const assetTypeService = new IRECAssetService();

        const encoded = AssetType.Solar | AssetType.Concentration | AssetType.Thermal;

        const hasSolar = assetTypeService.includes(encoded, AssetType.Solar);
        const hasPhotoVoltaic = assetTypeService.includes(encoded, AssetType.Photovoltaic);

        assert.isTrue(hasSolar);
        assert.isFalse(hasPhotoVoltaic);
    });

    it('should decode flags', () => {
        const assetTypeService = new IRECAssetService();

        const encoded = AssetType.Solar | AssetType.Concentration | AssetType.Thermal;

        const decoded = assetTypeService.decode(encoded);

        const hasSolar = decoded.includes('Solar');
        const hasThermal = decoded.includes('Thermal');
        const hasWind = decoded.includes('Wind');

        assert.isTrue(hasSolar);
        assert.isTrue(hasThermal);
        assert.isFalse(hasWind);
    });
});
