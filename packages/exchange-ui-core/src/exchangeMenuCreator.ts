import { UserStatus, isRole, Role, IUser } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { Exchange, BundlesTable, CreateBundleForm, MyOrders, MyTrades } from './containers';
import { IBundleTableProps } from './containers/BundlesTable';

interface IExchangeMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features?: OriginFeature[];
    props?: IBundleTableProps;
}

export const exchangeMenuCreator = (user: IUser): IExchangeMenuItem[] => {
    const userIsActive = user && user.status === UserStatus.Active;

    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    return [
        {
            key: 'view-market',
            label: 'navigation.certificates.exchange',
            component: Exchange,
            show: true,
            features: [OriginFeature.Exchange]
        },
        {
            key: 'bundles',
            label: 'navigation.certificates.bundles',
            component: BundlesTable,
            show: true,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'create_bundle',
            label: 'navigation.certificates.create_bundle',
            component: CreateBundleForm,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'my_bundles',
            label: 'navigation.certificates.my_bundles',
            component: BundlesTable,
            props: { owner: true },
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange, OriginFeature.Bundles]
        },
        {
            key: 'my-trades',
            label: 'navigation.certificates.myTrades',
            component: MyTrades,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange]
        },
        {
            key: 'my_orders',
            label: 'navigation.certificates.myOrders',
            component: MyOrders,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Exchange]
        }
    ];
};
