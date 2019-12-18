import { RequestHandler } from 'express';

import { marketContractLookupGetAction } from './controller/MarketContractLookupGet';
import { marketContractLookupPostAction } from './controller/MarketContractLookupPost';
import { marketContractLookupDeleteAction } from './controller/MarketContractLookupDelete';
import { jsonEntityGetAction } from './controller/JsonEntityGet';
import { jsonEntityPostAction } from './controller/JsonEntityPost';
import { jsonEntityDeleteAction } from './controller/JsonEntityDelete';
import { currencyGetAction } from './controller/CurrencyGet';
import { currencyPostAction } from './controller/CurrencyPost';
import { currencyDeleteAction } from './controller/CurrencyDelete';
import { imagePostActions } from './controller/ImagePost';

export interface IRoute {
    path: string;
    method: string;
    actions: Array<RequestHandler>;
}

/**
 * All application routes.
 */
export const AppRoutes: IRoute[] = [
    {
        path: '/MarketContractLookup',
        method: 'get',
        actions: [marketContractLookupGetAction]
    },
    {
        path: '/MarketContractLookup/:address',
        method: 'post',
        actions: [marketContractLookupPostAction]
    },
    {
        path: '/MarketContractLookup/:address',
        method: 'delete',
        actions: [marketContractLookupDeleteAction]
    },
    {
        path: '/Entity/:hash?',
        method: 'get',
        actions: [jsonEntityGetAction]
    },
    {
        path: '/Entity/:hash',
        method: 'post',
        actions: [jsonEntityPostAction]
    },
    {
        path: '/Entity/:hash',
        method: 'delete',
        actions: [jsonEntityDeleteAction]
    },
    {
        path: '/Currency/:code?',
        method: 'get',
        actions: [currencyGetAction]
    },
    {
        path: '/Currency/:code',
        method: 'post',
        actions: [currencyPostAction]
    },
    {
        path: '/Currency/:code',
        method: 'delete',
        actions: [currencyDeleteAction]
    },
    {
        path: '/Image',
        method: 'post',
        actions: imagePostActions
    }
];
