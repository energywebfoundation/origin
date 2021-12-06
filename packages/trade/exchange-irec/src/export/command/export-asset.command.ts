import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class ExportAssetCommand {
    constructor(
        public user: ILoggedInUser,
        public assetId: string,
        public recipientTradeAccount: string,
        public amount: string,
        public fromTradeAccount?: string
    ) {}
}
