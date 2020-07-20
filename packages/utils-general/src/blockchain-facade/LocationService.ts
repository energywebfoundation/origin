export interface ILocationService {
    matches(currentLocation: string[], checkedLocation: string): boolean;
    matchesSome(currentLocation: string[], checkedLocations: string[]): boolean;
    encode(decoded: string[][]): string[];
    decode(encoded: string[]): string[][];
}

export class LocationService implements ILocationService {
    public matches(currentLocation: string[], checkedLocation: string) {
        const highestSpecificityTypes = this.filterForHighestSpecificity(
            currentLocation
        ).map((type) => [...this.decode([type])[0]]);

        return highestSpecificityTypes.some((location) =>
            checkedLocation.startsWith(this.encode([location])[0])
        );
    }

    public matchesSome(currentLocation: string[], checkedLocations: string[]) {
        const highestSpecificityTypes = this.filterForHighestSpecificity(
            currentLocation
        ).map((type) => [...this.decode([type])[0]]);

        return highestSpecificityTypes.some((location) =>
            checkedLocations.some((checkedLocation) =>
                checkedLocation.startsWith(this.encode([location])[0])
            )
        );
    }

    public encode(decoded: string[][]): string[] {
        return decoded.map((group) => group.join(';'));
    }

    public decode(encoded: string[]): string[][] {
        return encoded.map((item) => item.split(';'));
    }

    private filterForHighestSpecificity(types: string[]): string[] {
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
}
