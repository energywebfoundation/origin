export class ExternalDeviceAlreadyUsedError extends Error {
    constructor(externalRegistryId: string) {
        super(`Device ${externalRegistryId} is already registered`);
    }
}
