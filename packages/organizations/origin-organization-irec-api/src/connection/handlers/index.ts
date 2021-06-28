import { CreateConnectionHandler } from './create-connection.handler';
import { GetConnectionHandler } from './get-connection.handler';
import { RefreshAllTokensHandler } from './refresh-all-tokens.handler';
import { RefreshTokensHandler } from './refresh-tokens.handler';

export const ConnectionHandlers = [
    CreateConnectionHandler,
    GetConnectionHandler,
    RefreshAllTokensHandler,
    RefreshTokensHandler
];
