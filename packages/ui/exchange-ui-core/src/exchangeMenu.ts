import { useSelector } from 'react-redux';
import { UserStatus, isRole, Role, IUser } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { getUserOffchain } from '@energyweb/origin-ui-core';
import {
    ViewMarket,
    BundlesTable,
    CreateBundleForm,
    MyOrders,
    MyTrades,
    SupplyTable
} from './containers';
import { IBundleTableProps } from './containers/BundlesTable';

interface IExchangeMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features?: OriginFeature[];
    props?: IBundleTableProps;
}

export const useExchangeMenu = (): IExchangeMenuItem[] => {
    const user: IUser = useSelector(getUserOffchain);
    const userIsActive = user && user.status === UserStatus.Active;

    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    return [
        {
            key: 'view-market',
            label: 'navigation.exchange.view_market',
            component: ViewMarket,
            show: true,
            features: [OriginFeature.Exchange]
        },
        {
            key: 'bundles',
            label: 'navigation.exchange.bundles',
            component: BundlesTable,
            show: true,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'create_bundle',
            label: 'navigation.exchange.create_bundle',
            component: CreateBundleForm,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'my_bundles',
            label: 'navigation.exchange.my_bundles',
            component: BundlesTable,
            props: { owner: true },
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'my-trades',
            label: 'navigation.exchange.my_trades',
            component: MyTrades,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange]
        },
        {
            key: 'my_orders',
            label: 'navigation.exchange.my_orders',
            component: MyOrders,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange]
        },
        {
            key: 'supply',
            label: 'navigation.exchange.supply',
            component: SupplyTable,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange]
        }
    ];
};
