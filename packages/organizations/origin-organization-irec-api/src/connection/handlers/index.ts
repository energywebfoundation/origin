import { CreateConnectionHandler } from './create-connection.handler';
import { GetConnectionHandler } from './get-connection.handler';
import { RefreshAllTokensHandler } from './refresh-all-tokens.handler';
import { RefreshTokensHandler } from './refresh-tokens.handler';
import { GetAccountsHandler } from './get-accounts.handler';

export const ConnectionHandlers = [
    CreateConnectionHandler,
    GetAccountsHandler,
    GetConnectionHandler,
    RefreshAllTokensHandler,
    RefreshTokensHandler
];
