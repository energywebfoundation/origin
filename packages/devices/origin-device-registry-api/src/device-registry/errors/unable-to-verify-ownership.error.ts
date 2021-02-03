export class UnableToVerifyOwnershipError extends Error {
    constructor(ownerId: string, externalRegistryId: string) {
        super(`Device ${externalRegistryId} is not owned by ${ownerId}`);
    }
}
