export type EncodedDeviceType = string[];
export type DecodedDeviceType = string[][];

export interface IDeviceTypeService {
    deviceTypes: DecodedDeviceType;
    encode(deviceTypes: DecodedDeviceType): EncodedDeviceType;
    decode(encodedDeviceType: EncodedDeviceType): DecodedDeviceType;
    includesDeviceType(current: string, requested: string[]): boolean;
    includesSomeDeviceType(current: string[], requested: string[]): boolean;
    validate(deviceTypes: string[]): { areValid: boolean; unknown: string[] };
    getDisplayText(deviceType: string): string;
}

export class DeviceTypeService implements IDeviceTypeService {
    constructor(public readonly deviceTypes: DecodedDeviceType) {
        if (!deviceTypes) {
            throw new Error('DeviceTypeService: deviceTypes argument is required');
        }
    }

    encode(deviceTypes: DecodedDeviceType): EncodedDeviceType {
        const encoded = deviceTypes.map((group) => group.join(';'));

        const { areValid, unknown } = this.validate(encoded);
        if (!areValid) {
            throw new Error(`DeviceTypeService::encode Unknown device types ${unknown}`);
        }

        return encoded;
    }

    decode(encodedDeviceType: EncodedDeviceType): DecodedDeviceType {
        const { areValid, unknown } = this.validate(encodedDeviceType);
        if (!areValid) {
            throw new Error(`DeviceTypeService::decode Unknown device types ${unknown}`);
        }

        return encodedDeviceType.map((deviceType) => deviceType.split(';'));
    }

    filterForHighestSpecificity(types: string[]): string[] {
        const decodedTypes = types.map((type) => [...this.decode([type])[0]]);

        return this.encode(
            decodedTypes.filter(
                (type) =>
                    !decodedTypes.some(
                        (nestedType) => nestedType[0] === type[0] && type.length < nestedType.length
                    )
            )
        );
    }

    includesDeviceType(checkedType: string, types: string[]): boolean {
        const highestSpecificityTypes = this.filterForHighestSpecificity(types).map((type) => [
            ...this.decode([type])[0]
        ]);

        return highestSpecificityTypes.some((requestedDeviceType) =>
            checkedType.startsWith(this.encode([requestedDeviceType])[0])
        );
    }

    includesSomeDeviceType(checkedTypes: string[], types: string[]): boolean {
        const highestSpecificityTypes = this.filterForHighestSpecificity(types).map((type) => [
            ...this.decode([type])[0]
        ]);

        return highestSpecificityTypes.some((requestedDeviceType) =>
            checkedTypes.some((checkedType) =>
                checkedType.startsWith(this.encode([requestedDeviceType])[0])
            )
        );
    }

    validate(deviceTypes: string[]): { areValid: boolean; unknown: string[] } {
        const encoded: EncodedDeviceType = this.deviceTypes.map((group) => group.join(';'));
        const unknown: string[] = [];

        const areValid = deviceTypes
            .map((deviceType) => {
                const valid = encoded.includes(deviceType);
                if (!valid) {
                    unknown.push(deviceType);
                }
                return valid;
            })
            .every((deviceType) => deviceType);

        return { areValid, unknown };
    }

    getDisplayText(deviceType: string) {
        return deviceType ? this.decode([deviceType])[0].join(' - ') : 'Unknown';
    }
}
