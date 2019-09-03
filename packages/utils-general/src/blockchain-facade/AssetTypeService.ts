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
    Onshore: 1 << 16,
    Offshore: 1 << 17,
    Currents: 1 << 18,
    Pressure: 1 << 19,
    Thermal: 1 << 20,
    Solid: 1 << 21,
    'Muncipal waste': 1 << 22,
    Biogenic: 1 << 23,
    'Industrial and commercial waste': 1 << 24,
    Wood: 1 << 25,
    'Forestry products': 1 << 26,
    'Forestry by-products & waste': 1 << 27,
    'Animal fats': 1 << 28,
    'Biomass from agriculture': 1 << 29,
    'Agricultural products': 1 << 30,
    'Agricultural by-products & waste': 1 << 31,
    Liquid: 1 << 32,
    'Municipal biodegradable waste': 1 << 33,
    'Black liquor': 1 << 34,
    'Pure plant oil': 1 << 35,
    'Waste plant oil': 1 << 36,
    'Refined vegetable oil': 1 << 37,
    'Biodiesel (mono-alkyl ester)': 1 << 38,
    'Biogasoline (C6-C12 hydrocarbon)': 1 << 39,
    Gaseous: 1 << 40,
    'Landfill gas': 1 << 41,
    'Sewage gas': 1 << 42,
    'Agricultural gas': 1 << 43,
    'Animal manure': 1 << 44,
    'Energy crops': 1 << 45,
    'Gas from organic waste digestion': 1 << 46,
    'Process gas': 1 << 47
};

export interface IAssetStructure {
    type: string;
    subType?: IAssetStructure[];
}

export interface IAssetService {
    AssetTypes: IAssetStructure[];
    encode(assetTypes: string[]): number;
    decode(assetType: number): IterableIterator<string>;
    includes(current: number, requested: number): boolean;
}

export class IRECAssetService implements IAssetService {
    public get AssetTypes(): IAssetStructure[] {
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
        return (current & requested) === requested);
    }
}
