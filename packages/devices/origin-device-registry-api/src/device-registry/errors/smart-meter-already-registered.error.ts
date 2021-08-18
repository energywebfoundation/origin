import { ConflictException } from '@nestjs/common';

export class SmartMeterAlreadyUsedError extends ConflictException {
    constructor(smartMeterId: string) {
        super(`Device with smartMeterId ${smartMeterId} is already registered`);
    }
}
