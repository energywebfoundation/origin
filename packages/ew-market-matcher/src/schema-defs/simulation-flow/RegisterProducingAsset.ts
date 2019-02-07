import * as EwAsset from 'ew-asset-registry-lib';
import { IdentifiableEntity } from './index';

export interface ProducingAssetData extends IdentifiableEntity {
    offChainProperties: EwAsset.ProducingAsset.OffChainProperties;
    onChainProperties: EwAsset.ProducingAsset.OnChainProperties;
}

export interface RegisterProducingAssetAction {
    type: RegisterProducingAssetActionType;
    data: ProducingAssetData;
}

export enum RegisterProducingAssetActionType {
    RegisterProducingAsset = 'REGISTER_PRODUCING_ASSET',
}

export const producingAssetDataToEntity = (producingAssetData: ProducingAssetData): EwAsset.ProducingAsset.Entity => {
    const asset = new EwAsset.ProducingAsset.Entity(producingAssetData.id, null);
    asset.offChainProperties = producingAssetData.offChainProperties;

    Object.keys(producingAssetData.onChainProperties)
        .forEach((key: string) => asset[key] = producingAssetData.onChainProperties[key]);
    return asset;

};

// const test: ProducingAssetData = {
//     id: '0',
//     offChainProperties: {
//         assetType: 0,
//         complianceRegistry: 0,
//         otherGreenAttributes: '',
//         typeOfPublicSupport: '',
//         operationalSince: 0,
//         capacityWh: 100,
//         country: '',
//         region: '',
//         zip: '',
//         city: '',
//         street: '',
//         houseNumber: '',
//         gpsLatitude: '',
//         gpsLongitude: ''

//     },
//     onChainProperties: {
//         certificatesUsedForWh: 0,
//         smartMeter: {
//             address: '0x0',
//         },
//         owner: {
//             address: '0x0',
//         },
//         lastSmartMeterReadWh: 0,
//         active: true,
//         lastSmartMeterReadFileHash: '0x0',
//         matcher: [
//             {
//                 address: '0x492fd96a45b842fd1834b36c4055e5bc35c3dcb6',
//             },
//         ],
//     },
// }