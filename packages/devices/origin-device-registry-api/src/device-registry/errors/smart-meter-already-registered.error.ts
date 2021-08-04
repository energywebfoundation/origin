export class SmartMeterAlreadyUsedError extends Error {
    constructor(smartMeterId: string) {
        super(`Device's smartMeteId (${smartMeterId}) is already registered`);
    }
}
