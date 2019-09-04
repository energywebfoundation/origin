// export enum AssetType {
//     Solar = 0,
//     Photovoltaic = 1 << 1,
//     RoofMounted = 1 << 2,
//     GroundMounted = 1 << 3,
//     Concentration = 1 << 4,
//     Wind = 1 << 5,
//     Onshore = 1 << 6,
//     Offshore = 1 << 7,
//     HydroElectricHead = 1 << 8,
//     RunOfRiverHeadInstallation = 1 << 9,
//     StorageHeadInstallation = 1 << 10,
//     PurePumpedStorageHeadInstallation = 1 << 11,
//     MixedPumpedStorageHead = 1 << 12,
//     Marine = 1 << 13,
//     Tidal = 1 << 14,
//     InShore = 1 << 15,
//     Wave = 1 << 16,
//     Currents = 1 << 17,
//     Pressure = 1 << 18,
//     Thermal = 1 << 19,
//     Solid = 1 << 20,
//     MuncipalWaste = 1 << 21,
//     Biogenic = 1 << 22,
//     IndustrialAndCommercialWaste = 1 << 23,
//     Wood = 1 << 24,
//     ForestryProducts = 1 << 25,
//     ForestryByProductsAndWaste = 1 << 26,
//     AnimalFats = 1 << 27,
//     BiomassFromAgriculture = 1 << 28,
//     AgriculturalProducts = 1 << 29,
//     AgriculturalByProductsAndWaste = 1 << 30,
//     Liquid = 1 << 31,
//     MunicipalBiodegradableWaste,
//     BlackLiquor,
//     PurePlantOil,
//     WastePlantOil,
//     RefinedVegetableOil,
//     BiodieselMonoAlkylEster
// }

export const AssetType = {
    Solar: 0,
    Photovoltaic: 1 << 1,
    'Roof mounted': 1 << 2,
    'Ground mounted': 1 << 3,
    Concentration: 1 << 3,
    Wind: 1 << 4,
    Onshore: 1 << 5,
    Offshore: 1 << 6,
    'Hydro-electric Head': 1 << 7,
    'Run-of-river head installation': 1 << 8,
    'Storage head installation': 1 << 9,
    'Pure pumped storage head installation': 1 << 10,
    'Mixed pumped storage head': 1 << 11,
    Marine: 1 << 12,
    Tidal: 1 << 13,
    Inshore: 1 << 14,
    Wave: 1 << 15,
    Currents: 1 << 16,
    Pressure: 1 << 17,
    Thermal: 1 << 18,
    Solid: 1 << 19,
    'Muncipal waste': 1 << 20,
    Biogenic: 1 << 21,
    'Industrial and commercial waste': 1 << 22,
    Wood: 1 << 23,
    'Forestry products': 1 << 24,
    'Forestry by-products & waste': 1 << 25,
    'Animal fats': 1 << 26,
    'Biomass from agriculture': 1 << 27,
    'Agricultural products': 1 << 28,
    'Agricultural by-products & waste': 1 << 29,
    Liquid: 1 << 30,
    'Municipal biodegradable waste': 1 << 31,
    'Black liquor': 1 << 32,
    'Pure plant oil': 1 << 33,
    'Waste plant oil': 1 << 34,
    'Refined vegetable oil': 1 << 35,
    'Biodiesel (mono-alkyl ester)': 1 << 36,
    'Biogasoline (C6-C12 hydrocarbon)': 1 << 37,
    Gaseous: 1 << 38,
    'Landfill gas': 1 << 39,
    'Sewage gas': 1 << 40,
    'Agricultural gas': 1 << 41,
    'Animal manure': 1 << 42,
    'Energy crops': 1 << 43,
    'Gas from organic waste digestion': 1 << 44,
    'Process gas': 1 << 45
};

export interface IAssetTypeStructure {
    type: string;
    subType?: IAssetTypeStructure[];
}

export interface IAssetService {
    AssetTypes: IAssetTypeStructure[];
    encode(assetTypes: string[]): number;
    decode(assetType: number): IterableIterator<string>;
    includes(current: number, requested: number): boolean;
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

    encode(assetTypes: string[]): number {
        return assetTypes.map(type => AssetType[type]).reduce((prev, current) => (prev |= current));
    }

    *decode(assetType: number) {
        for (const type in AssetType) {
            const value = AssetType[type];

            if ((assetType & value) === value) {
                yield type;
            }
        }
    }

    includes(current: number, requested: number): boolean {
        return (current & requested) === requested;
    }
}
