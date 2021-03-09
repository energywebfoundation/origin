import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { AccessTokens } from '@energyweb/issuer-irec-api-wrapper';

export class RefreshTokensCommand {
    constructor(
        public readonly user: ILoggedInUser | string | number,
        public readonly accessTokens: AccessTokens
    ) {}
}
