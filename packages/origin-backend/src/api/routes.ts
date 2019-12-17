import { Request, Response } from 'express';

import { MarketContractLookupActions } from './controller/MarketContractLookupActions';
import { JsonEntityActions } from './controller/JsonEntityActions';
import { CurrencyActions } from './controller/CurrencyActions';
import { ComplianceActions } from './controller/ComplianceActions';

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
        action: MarketContractLookupActions.get
    },
    {
        path: '/MarketContractLookup',
        method: 'post',
        action: MarketContractLookupActions.post
    },
    {
        path: '/MarketContractLookup',
        method: 'delete',
        action: MarketContractLookupActions.delete
    },
    {
        path: '/Entity/:hash?',
        method: 'get',
        action: JsonEntityActions.get
    },
    {
        path: '/Entity/:hash',
        method: 'post',
        action: JsonEntityActions.post
    },
    {
        path: '/Entity/:hash',
        method: 'delete',
        action: JsonEntityActions.delete
    },
    {
        path: '/Currency',
        method: 'get',
        action: CurrencyActions.get
    },
    {
        path: '/Currency',
        method: 'post',
        action: CurrencyActions.post
    },
    {
        path: '/Currency',
        method: 'delete',
        action: CurrencyActions.delete
    },
    {
        path: '/Compliance',
        method: 'get',
        action: ComplianceActions.get
    },
    {
        path: '/Compliance',
        method: 'post',
        action: ComplianceActions.post
    },
    {
        path: '/Compliance',
        method: 'delete',
        action: ComplianceActions.delete
    }
];
