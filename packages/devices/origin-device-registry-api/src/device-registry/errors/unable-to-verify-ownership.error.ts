import { ForbiddenException } from '@nestjs/common';

export class UnableToVerifyOwnershipError extends ForbiddenException {
    constructor(ownerId: string, externalRegistryId: string) {
        super(`Device ${externalRegistryId} is not owned by ${ownerId}`);
    }
}
