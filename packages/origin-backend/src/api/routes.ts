import { Request, Response } from "express";

import { marketContractLookupGetAction } from './controller/MarketContractLookupGet';
import { marketContractLookupPostAction } from './controller/MarketContractLookupPost';
import { marketContractLookupDeleteAction } from './controller/MarketContractLookupDelete';
import { anyEntityGetAction } from './controller/AnyEntityGet';
import { anyEntityPostAction } from './controller/AnyEntityPost';
import { anyEntityPutAction } from './controller/AnyEntityPut';
import { anyEntityDeleteAction } from './controller/AnyEntityDelete';

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
        action: anyEntityGetAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'post',
        action: anyEntityPostAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'put',
        action: anyEntityPutAction
    },
    {
        path: '/:type/:contractAddress/:identifier',
        method: 'delete',
        action: anyEntityDeleteAction
    }
];