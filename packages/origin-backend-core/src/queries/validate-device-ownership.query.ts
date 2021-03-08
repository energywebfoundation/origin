export class ValidateDeviceOwnershipQuery {
    constructor(public readonly ownerId: string, public readonly externalRegistryId: string) {}
}
