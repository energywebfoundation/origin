import { ConflictException } from '@nestjs/common';

export class SmartMeterAlreadyUsedError extends ConflictException {
    constructor(externalRegistryId: string) {
        super(`Device ${externalRegistryId} is already registered`);
    }
}
