import { RequestHandler } from 'express';

import { IActions } from './actions/IActions';

import { MarketContractLookupActions } from './actions/MarketContractLookupActions';
import { JsonEntityActions } from './actions/JsonEntityActions';
import { CurrencyActions } from './actions/CurrencyActions';
import { ComplianceActions } from './actions/ComplianceActions';
import { CountryActions } from './actions/CountryActions';
import { imagePostActions } from './actions/ImagePost';

export interface IRoute {
    path: string;
    method: string;
    actions: Array<RequestHandler>;
}

const routeGenerator = (endpointName: string, actions: IActions, paramName?: string): IRoute[] => {
    const path = `/${endpointName}${paramName ? `/:${paramName}` : ''}`;

    return [
        {
            path: path + '?',
            method: 'get',
            actions: [actions.get]
        },
        {
            path,
            method: 'post',
            actions: [actions.post]
        },
        {
            path,
            method: 'delete',
            actions: [actions.delete]
        }
    ];
};

const marketContractLookupRoutes = routeGenerator('MarketContractLookup', MarketContractLookupActions);
const jsonEntityRoutes = routeGenerator('Entity', JsonEntityActions, 'hash');
const currencyRoutes = routeGenerator('Currency', CurrencyActions);
const complianceRoutes = routeGenerator('Compliance', ComplianceActions);
const countryRoutes = routeGenerator('Country', CountryActions);

/**
 * All application routes.
 */
export const AppRoutes: IRoute[] = marketContractLookupRoutes.concat(
    jsonEntityRoutes,
    currencyRoutes,
    complianceRoutes,
    countryRoutes,
    [{
        path: '/Image',
        method: 'post',
        actions: imagePostActions
    }]
);
