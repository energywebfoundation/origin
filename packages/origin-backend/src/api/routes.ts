import { RequestHandler } from 'express';

import { MarketContractLookupActions } from './controller/MarketContractLookupActions';
import { JsonEntityActions } from './controller/JsonEntityActions';
import { CurrencyActions } from './controller/CurrencyActions';
import { ComplianceActions } from './controller/ComplianceActions';
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
        actions: [MarketContractLookupActions.get]
    },
    {
        path: '/MarketContractLookup',
        method: 'post',
        actions: [MarketContractLookupActions.post]
    },
    {
        path: '/MarketContractLookup',
        method: 'delete',
        actions: [MarketContractLookupActions.delete]
    },
    {
        path: '/Entity/:hash?',
        method: 'get',
        actions: [JsonEntityActions.get]
    },
    {
        path: '/Entity/:hash',
        method: 'post',
        actions: [JsonEntityActions.post]
    },
    {
        path: '/Entity/:hash',
        method: 'delete',
        actions: [JsonEntityActions.delete]
    },
    {
        path: '/Currency',
        method: 'get',
        actions: [CurrencyActions.get]
    },
    {
        path: '/Currency',
        method: 'post',
        actions: [CurrencyActions.post]
    },
    {
        path: '/Currency',
        method: 'delete',
        actions: [CurrencyActions.delete]
    },
    {
        path: '/Compliance',
        method: 'get',
        actions: [ComplianceActions.get]
    },
    {
        path: '/Compliance',
        method: 'post',
        actions: [ComplianceActions.post]
    },
    {
        path: '/Compliance',
        method: 'delete',
        actions: [ComplianceActions.delete]
    },
    {
        path: '/Image',
        method: 'post',
        actions: imagePostActions
    }
];
