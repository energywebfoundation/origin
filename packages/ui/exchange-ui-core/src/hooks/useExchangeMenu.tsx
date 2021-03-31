import React, { useMemo } from 'react';
import { OriginFeature } from '@energyweb/utils-general';

import { useUserInfo } from '@energyweb/origin-ui-core';
import { CreateBundlePage } from '../pages/CreateBundlePage';
import { BundlesTablePage, IBundleTableProps } from '../pages/BundlesTable';
import { MyTradesPage } from '../pages/MyTradesPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { SupplyTablePage } from '../pages/SupplyTablePage';
import { ViewMarketPage } from '../pages/ViewMarketPage';

interface IExchangeMenuItem {
    key: string;
    label: string;
    render: () => any;
    show: boolean;
    features?: OriginFeature[];
    props?: IBundleTableProps;
}

export const useExchangeMenu = (): IExchangeMenuItem[] => {
    const { userIsActiveAndPartOfOrg } = useUserInfo();

    return useMemo(
        () => [
            {
                key: 'view-market',
                label: 'navigation.exchange.view_market',
                render() {
                    return <ViewMarketPage />;
                },
                show: true,
                features: [OriginFeature.Exchange]
            },
            {
                key: 'bundles',
                label: 'navigation.exchange.bundles',
                render() {
                    return <BundlesTablePage owner={false} />;
                },
                show: true,
                features: [OriginFeature.Exchange, OriginFeature.Bundles]
            },
            {
                key: 'create_bundle',
                label: 'navigation.exchange.create_bundle',
                render() {
                    return <CreateBundlePage />;
                },
                show: userIsActiveAndPartOfOrg,
                features: [OriginFeature.Exchange, OriginFeature.Bundles]
            },
            {
                key: 'my_bundles',
                label: 'navigation.exchange.my_bundles',
                render() {
                    return <BundlesTablePage owner={true} />;
                },
                props: { owner: true },
                show: userIsActiveAndPartOfOrg,
                features: [OriginFeature.Exchange, OriginFeature.Bundles]
            },
            {
                key: 'my-trades',
                label: 'navigation.exchange.my_trades',
                render() {
                    return <MyTradesPage />;
                },
                show: userIsActiveAndPartOfOrg,
                features: [OriginFeature.Exchange]
            },
            {
                key: 'my_orders',
                label: 'navigation.exchange.my_orders',
                render() {
                    return <MyOrdersPage />;
                },
                show: userIsActiveAndPartOfOrg,
                features: [OriginFeature.Exchange]
            },
            {
                key: 'supply',
                label: 'navigation.exchange.supply',
                render() {
                    return <SupplyTablePage />;
                },
                show: userIsActiveAndPartOfOrg,
                features: [OriginFeature.Exchange]
            }
        ],
        [userIsActiveAndPartOfOrg]
    );
};
