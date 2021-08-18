import { ConflictException } from '@nestjs/common';

export class ExternalDeviceAlreadyUsedError extends ConflictException {
    constructor(externalRegistryId: string) {
        super(`Device ${externalRegistryId} is already registered`);
    }
}
