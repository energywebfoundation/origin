export type EncodedAssetType = string[];
export type DecodedAssetType = string[][];

export interface IAssetService {
    AssetTypes: DecodedAssetType;
    encode(assetTypes: DecodedAssetType): EncodedAssetType;
    decode(encodedAssetType: EncodedAssetType): DecodedAssetType;
    includesAssetType(current: string, requested: string[]): boolean;
    validate(assetTypes: string[]): { areValid: boolean; unknown: string[] };
}

export class IRECAssetService implements IAssetService {
    public get AssetTypes() {
        return [
            ['Solar'],
            ['Solar', 'Photovoltaic'],
            ['Solar', 'Photovoltaic', 'Roof mounted'],
            ['Solar', 'Photovoltaic', 'Ground mounted'],
            ['Solar', 'Concentration'],
            ['Wind'],
            ['Wind', 'Onshore'],
            ['Wind', 'Offshore'],
            ['Hydro-electric Head'],
            ['Hydro-electric Head', 'Run-of-river head installation'],
            ['Hydro-electric Head', 'Storage head installation'],
            ['Hydro-electric Head', 'Pure pumped storage head installation'],
            ['Hydro-electric Head', 'Mixed pumped storage head'],
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
            ['Solid'],
            ['Solid', 'Muncipal waste'],
            ['Solid', 'Muncipal waste', 'Biogenic'],
            ['Solid', 'Industrial and commercial waste'],
            ['Solid', 'Industrial and commercial waste', 'Biogenic'],
            ['Solid', 'Wood'],
            ['Solid', 'Wood', 'Forestry products'],
            ['Solid', 'Wood', 'Forestry by-products & waste'],
            ['Solid', 'Animal fats'],
            ['Solid', 'Biomass from agriculture'],
            ['Solid', 'Biomass from agriculture', 'Agricultural products'],
            ['Solid', 'Biomass from agriculture', 'Agricultural by-products & waste'],
            ['Liquid'],
            ['Liquid', 'Municipal biodegradable waste'],
            ['Liquid', 'Black liquor'],
            ['Liquid', 'Pure plant oil'],
            ['Liquid', 'Waste plant oil'],
            ['Liquid', 'Refined vegetable oil'],
            ['Liquid', 'Refined vegetable oil', 'Biodiesel (mono-alkyl ester)'],
            ['Liquid', 'Refined vegetable oil', 'Biogasoline (C6-C12 hydrocarbon)'],
            ['Gaseous'],
            ['Gaseous', 'Landfill gas'],
            ['Gaseous', 'Sewage gas'],
            ['Gaseous', 'Agricultural gas'],
            ['Gaseous', 'Agricultural gas', 'Animal manure'],
            ['Gaseous', 'Agricultural gas', 'Energy crops'],
            ['Gaseous', 'Gas from organic waste digestion'],
            ['Gaseous', 'Process gas'],
            ['Gaseous', 'Process gas', 'Biogenic']
        ];
    }

    encode(assetTypes: DecodedAssetType): EncodedAssetType {
        const encoded = assetTypes.map(group => group.join(';'));

        const { areValid, unknown } = this.validate(encoded);
        if (!areValid) {
            throw new Error(`IRECAssetService::encode Unknown asset types ${unknown}`);
        }

        return encoded;
    }

    decode(encodedAssetType: EncodedAssetType): DecodedAssetType {
        const { areValid, unknown } = this.validate(encodedAssetType);
        if (!areValid) {
            throw new Error(`IRECAssetService::decode Unknown asset types ${unknown}`);
        }

        return encodedAssetType.map(assetType => assetType.split(';'));
    }

    filterForHighestSpecificity(types: string[]): string[] {
        const decodedTypes = types.map(type => [...this.decode([type])[0]]);

        return this.encode(
            decodedTypes.filter(
                type =>
                    !decodedTypes.some(
                        nestedType => nestedType[0] === type[0] && type.length < nestedType.length
                    )
            )
        );
    }

    includesAssetType(current: string, requested: string[]): boolean {
        const highestSpecificityTypes = this.filterForHighestSpecificity(requested).map(type => [
            ...this.decode([type])[0]
        ]);

        for (const assetType of highestSpecificityTypes) {
            const decodedTypeToCheck = [...this.decode([current])[0]];

            if (
                JSON.stringify(assetType) === JSON.stringify(decodedTypeToCheck) ||
                (assetType.length < decodedTypeToCheck.length &&
                    assetType.every(
                        (type, index) =>
                            type === decodedTypeToCheck[index] || !decodedTypeToCheck[index]
                    ))
            ) {
                return true;
            }
        }

        return false;
    }

    validate(assetTypes: string[]): { areValid: boolean; unknown: string[] } {
        const encoded: EncodedAssetType = this.AssetTypes.map(group => group.join(';'));
        const unknown: string[] = [];

        const areValid = assetTypes
            .map(assetType => {
                const valid = encoded.includes(assetType);
                if (!valid) {
                    unknown.push(assetType);
                }
                return valid;
            })
            .every(assetType => assetType);

        return { areValid, unknown };
    }

    getDisplayText(assetType: string) {
        return this.decode([assetType])[0].join(' - ');
    }
}
