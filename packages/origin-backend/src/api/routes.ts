import { RequestHandler } from 'express';

import { IActions } from './actions/IActions';

import { MarketContractLookupActions } from './actions/MarketContractLookupActions';
import { JsonEntityActions } from './actions/JsonEntityActions';
import { CurrencyActions } from './actions/CurrencyActions';
import { ComplianceActions } from './actions/ComplianceActions';
import { CountryActions } from './actions/CountryActions';
import { imagePostActions } from './actions/ImagePost';
import { OrganizationActions } from './actions/OrganizationActions';

export interface IRoute {
    path: string;
    method: string;
    actions: Array<RequestHandler>;
}

const routeGenerator = (
    endpointName: string,
    actions: IActions,
    paramName?: string,
    omitPostParam?: boolean
): IRoute[] => {
    const basePath = `/${endpointName}`;
    const path = `${basePath}${paramName ? `/:${paramName}` : ''}`;
    const postPath = omitPostParam ? basePath : path;

    const routes = [
        {
            path: `${path}?`,
            method: 'get',
            actions: [actions.get]
        },
        {
            path: postPath,
            method: 'post',
            actions: [actions.post]
        },
        {
            path,
            method: 'delete',
            actions: [actions.delete]
        }
    ];

    if (actions.put) {
        routes.push({
            path,
            method: 'put',
            actions: [actions.put]
        });
    }

    return routes;
};

const marketContractLookupRoutes = routeGenerator(
    'MarketContractLookup',
    MarketContractLookupActions
);
const jsonEntityRoutes = routeGenerator('Entity', JsonEntityActions, 'hash');
const currencyRoutes = routeGenerator('Currency', CurrencyActions);
const complianceRoutes = routeGenerator('Compliance', ComplianceActions);
const countryRoutes = routeGenerator('Country', CountryActions);
const organizationRoutes = routeGenerator('Organization', OrganizationActions, 'id', true);

/**
 * All application routes.
 */
export const AppRoutes: IRoute[] = marketContractLookupRoutes.concat(
    jsonEntityRoutes,
    currencyRoutes,
    complianceRoutes,
    countryRoutes,
    organizationRoutes,
    [
        {
            path: '/Image',
            method: 'post',
            actions: imagePostActions
        }
    ]
);
