export type EncodedDeviceType = string[];
export type DecodedDeviceType = string[][];

export interface IDeviceService {
    DeviceTypes: DecodedDeviceType;
    encode(deviceTypes: DecodedDeviceType): EncodedDeviceType;
    decode(encodedDeviceType: EncodedDeviceType): DecodedDeviceType;
    includesDeviceType(current: string, requested: string[]): boolean;
    includesSomeDeviceType(current: string[], requested: string[]): boolean;
    validate(deviceTypes: string[]): { areValid: boolean; unknown: string[] };
}

export class IRECDeviceService implements IDeviceService {
    public get DeviceTypes() {
        return [
            ['Solar'],
            ['Solar', 'Photovoltaic'],
            ['Solar', 'Photovoltaic', 'Roof mounted'],
            ['Solar', 'Photovoltaic', 'Ground mounted'],
            ['Solar', 'Photovoltaic', 'Classic silicon'],
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
            ['Gaseous', 'Process gas', 'Biogenic'],
            ['Thermal'],
            ['Thermal', 'Internal combustion engine'],
            ['Thermal', 'Internal combustion engine', 'Non CHP'],
            ['Thermal', 'Internal combustion engine', 'CHP'],
            ['Thermal', 'Steam turbine with condensation turbine'],
            ['Thermal', 'Steam turbine with condensation turbine', 'Non CHP']
        ];
    }

    encode(deviceTypes: DecodedDeviceType): EncodedDeviceType {
        const encoded = deviceTypes.map(group => group.join(';'));

        const { areValid, unknown } = this.validate(encoded);
        if (!areValid) {
            throw new Error(`IRECDeviceService::encode Unknown device types ${unknown}`);
        }

        return encoded;
    }

    decode(encodedDeviceType: EncodedDeviceType): DecodedDeviceType {
        const { areValid, unknown } = this.validate(encodedDeviceType);
        if (!areValid) {
            throw new Error(`IRECDeviceService::decode Unknown device types ${unknown}`);
        }

        return encodedDeviceType.map(deviceType => deviceType.split(';'));
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

    includesDeviceType(checkedType: string, types: string[]): boolean {
        const highestSpecificityTypes = this.filterForHighestSpecificity(types).map(type => [
            ...this.decode([type])[0]
        ]);

        return highestSpecificityTypes.some(requestedDeviceType =>
            checkedType.startsWith(this.encode([requestedDeviceType])[0])
        );
    }

    includesSomeDeviceType(checkedTypes: string[], types: string[]): boolean {
        const highestSpecificityTypes = this.filterForHighestSpecificity(types).map(type => [
            ...this.decode([type])[0]
        ]);

        return highestSpecificityTypes.some(requestedDeviceType =>
            checkedTypes.some(checkedType =>
                checkedType.startsWith(this.encode([requestedDeviceType])[0])
            )
        );
    }

    validate(deviceTypes: string[]): { areValid: boolean; unknown: string[] } {
        const encoded: EncodedDeviceType = this.DeviceTypes.map(group => group.join(';'));
        const unknown: string[] = [];

        const areValid = deviceTypes
            .map(deviceType => {
                const valid = encoded.includes(deviceType);
                if (!valid) {
                    unknown.push(deviceType);
                }
                return valid;
            })
            .every(deviceType => deviceType);

        return { areValid, unknown };
    }

    getDisplayText(deviceType: string) {
        return this.decode([deviceType])[0].join(' - ');
    }
}
