export class SmartMeterAlreadyUsedError extends Error {
    constructor(externalRegistryId: string) {
        super(`Device ${externalRegistryId} is already registered`);
    }
}
