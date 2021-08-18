import { ConflictException } from '@nestjs/common';

export class ExternalDeviceAlreadyUsedError extends ConflictException {
    constructor(externalRegistryId: string) {
        super(`Device with externalRegistryId ${externalRegistryId} is already registered`);
    }
}
