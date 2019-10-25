import { Request, Response } from "express";

import { marketContractLookupGetAction } from './controller/MarketContractLookupGet';
import { marketContractLookupPostAction } from './controller/MarketContractLookupPost';
import { marketContractLookupDeleteAction } from './controller/MarketContractLookupDelete';
import { jsonEntityGetAction } from './controller/JsonEntityGet';
import { jsonEntityPostAction } from './controller/JsonEntityPost';
import { jsonEntityPutAction } from './controller/JsonEntityPut';
import { jsonEntityDeleteAction } from './controller/JsonEntityDelete';

export interface IRoute {
    path: string,
    method: string,
    action: (req: Request, res: Response) => Promise<void>
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
        path: '/:type/:contractAddress/:identifier?',
        method: 'get',
        action: jsonEntityGetAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'post',
        action: jsonEntityPostAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'put',
        action: jsonEntityPutAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'delete',
        action: jsonEntityDeleteAction
    }
];