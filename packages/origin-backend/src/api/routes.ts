import { Request, Response } from 'express';

import { marketContractLookupGetAction } from './controller/MarketContractLookupGet';
import { marketContractLookupPostAction } from './controller/MarketContractLookupPost';
import { marketContractLookupDeleteAction } from './controller/MarketContractLookupDelete';
import { jsonEntityGetAction } from './controller/JsonEntityGet';
import { jsonEntityPostAction } from './controller/JsonEntityPost';
import { jsonEntityDeleteAction } from './controller/JsonEntityDelete';
import { currencyGetAction } from './controller/CurrencyGet';
import { currencyPostAction } from './controller/CurrencyPost';
import { currencyDeleteAction } from './controller/CurrencyDelete';

export interface IRoute {
    path: string;
    method: string;
    action: (req: Request, res: Response) => Promise<void>;
}

/**
 * All application routes.
 */
export const AppRoutes: IRoute[] = [
    {
        path: '/MarketContractLookup',
        method: 'get',
        action: marketContractLookupGetAction
    },
    {
        path: '/MarketContractLookup/:address',
        method: 'post',
        action: marketContractLookupPostAction
    },
    {
        path: '/MarketContractLookup/:address',
        method: 'delete',
        action: marketContractLookupDeleteAction
    },
    {
        path: '/Entity/:hash?',
        method: 'get',
        action: jsonEntityGetAction
    },
    {
        path: '/Entity/:hash',
        method: 'post',
        action: jsonEntityPostAction
    },
    {
        path: '/Entity/:hash',
        method: 'delete',
        action: jsonEntityDeleteAction
    },
    {
        path: '/Currency/:code?',
        method: 'get',
        action: currencyGetAction
    },
    {
        path: '/Currency/:code',
        method: 'post',
        action: currencyPostAction
    },
    {
        path: '/Currency/:code',
        method: 'delete',
        action: currencyDeleteAction
    }
];
