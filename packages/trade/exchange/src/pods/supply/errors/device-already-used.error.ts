export class DeviceAlreadyUsedError extends Error {
    constructor(deviceId: string) {
        super(`Device supply ${deviceId} is already created`);
    }
}
