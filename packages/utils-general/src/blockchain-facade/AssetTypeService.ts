export interface IAssetTypeStructure {
    type: string;
    subType?: IAssetTypeStructure[];
}

export interface IAssetService {
    AssetTypes: IAssetTypeStructure[];
    encode(assetTypes: string[][]): string[];
    decode(encodedAssetType: string[]): string[][];
    includes(current: string[], requested: string[]): boolean;
}

export class IRECAssetService implements IAssetService {
    public get AssetTypes(): IAssetTypeStructure[] {
        return [
            {
                type: 'Solar',
                subType: [
                    {
                        type: 'Photovoltaic',
                        subType: [{ type: 'Roof mounted' }, { type: 'Ground mounted' }]
                    },
                    {
                        type: 'Concentration'
                    }
                ]
            },
            {
                type: 'Wind',
                subType: [{ type: 'Onshore' }, { type: 'Offshore' }]
            },
            {
                type: 'Hydro-electric Head',
                subType: [
                    {
                        type: 'Run-of-river head installation'
                    },
                    {
                        type: 'Storage head installation'
                    },
                    {
                        type: 'Pure pumped storage head installation'
                    },
                    {
                        type: 'Mixed pumped storage head'
                    }
                ]
            },
            {
                type: 'Marine',
                subType: [
                    {
                        type: 'Tidal',
                        subType: [{ type: 'Inshore' }, { type: 'Offshore' }]
                    },
                    {
                        type: 'Wave',
                        subType: [{ type: 'Onshore' }, { type: 'Offshore' }]
                    },
                    { type: 'Currents' },
                    { type: 'Pressure' },
                    { type: 'Thermal' }
                ]
            },
            {
                type: 'Solid',
                subType: [
                    {
                        type: 'Muncipal waste',
                        subType: [{ type: 'Biogenic' }]
                    },
                    {
                        type: 'Industrial and commercial waste',
                        subType: [{ type: 'Biogenic' }]
                    },
                    {
                        type: 'Wood',
                        subType: [
                            { type: 'Forestry products' },
                            { type: 'Forestry by-products & waste' }
                        ]
                    },
                    { type: 'Animal fats' },
                    {
                        type: 'Biomass from agriculture',
                        subType: [
                            { type: 'Agricultural products' },
                            { type: 'Agricultural by-products & waste' }
                        ]
                    }
                ]
            },
            {
                type: 'Liquid',
                subType: [
                    { type: 'Municipal biodegradable waste' },
                    { type: 'Black liquor' },
                    { type: 'Pure plant oil' },
                    { type: 'Waste plant oil' },
                    {
                        type: 'Refined vegetable oil',
                        subType: [
                            { type: 'Biodiesel (mono-alkyl ester)' },
                            { type: 'Biogasoline (C6-C12 hydrocarbon)' }
                        ]
                    }
                ]
            },
            {
                type: 'Gaseous',
                subType: [
                    { type: 'Landfill gas' },
                    { type: 'Sewage gas' },
                    {
                        type: 'Agricultural gas',
                        subType: [{ type: 'Animal manure' }, { type: 'Energy crops' }]
                    },
                    { type: 'Gas from organic waste digestion' },
                    {
                        type: 'Process gas',
                        subType: [{ type: 'Biogenic' }]
                    }
                ]
            }
        ];
    }

    encode(assetTypes: string[][]): string[] {
        return assetTypes.map(group => group.join(';'));
    }

    decode(encodedAssetType: string[]): string[][] {
        return encodedAssetType.map(assetType => assetType.split(';'));
    }

    includes(current: string[], requested: string[]): boolean {
        return requested.some(requestedAssetType =>
            current.find(assetType => assetType.includes(requestedAssetType))
        );
    }
}
