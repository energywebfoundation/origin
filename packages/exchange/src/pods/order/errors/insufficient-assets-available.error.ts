export class InsufficientAssetsAvailable extends Error {
    constructor(assetId: string) {
        super(`There is insufficient amount of ${assetId} deposited on user account`);
    }
}
