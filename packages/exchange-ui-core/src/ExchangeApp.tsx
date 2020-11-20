import React, { useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import {
    getCurrencies,
    useLinks,
    OriginConfigurationContext,
    getUserOffchain,
    PageContent,
    RoleChangedModal,
    ConnectBlockchainAccountModal
} from '@energyweb/origin-ui-core';
import { Exchange, MyTrades, BundlesTable, CreateBundleForm, MyOrders } from './containers';
import { initializeExchangeApp } from './features/general';

export function ExchangeApp() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeExchangeApp());
    }, []);

    const currencies = useSelector(getCurrencies);
    const user = useSelector(getUserOffchain);
    const { getExchangeLink } = useLinks();
    const { t } = useTranslation();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);
    const originConfiguration = useContext(OriginConfigurationContext);
    const enabledFeatures = originConfiguration?.enabledFeatures;

    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

    const ExchangeRoute = () => <Exchange currency={defaultCurrency} />;
    const TradesRoute = () => <MyTrades currency={defaultCurrency} />;

    const userIsActive = user && user.status === UserStatus.Active;

    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    const ExchangeMenu = [
        {
            key: 'view-market',
            label: 'navigation.certificates.exchange',
            component: ExchangeRoute,
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
            component: TradesRoute,
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

    const defaultRedirect = {
        pathname: `${getExchangeLink()}/${ExchangeMenu[0].key}`
    };

    return (
        <div className="PageWrapper">
            <div className="PageNav">
                <ul className="NavMenu nav">
                    {ExchangeMenu.map((menu) => {
                        if (
                            menu.show &&
                            menu.features.every((flag) => enabledFeatures?.includes(flag))
                        ) {
                            const link = `${getExchangeLink()}/${menu.key}`;

                            return (
                                <li key={menu.key}>
                                    <NavLink to={link}>{t(menu.label)}</NavLink>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>

            <Route
                path={`${getExchangeLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = ExchangeMenu.filter((item) => {
                        return item.key === key;
                    });

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getExchangeLink()}
                        />
                    );
                }}
            />
            <Route path={getExchangeLink()} render={() => <Redirect to={defaultRedirect} />} />
            <Route
                exact={true}
                path={getExchangeLink()}
                render={() => <Redirect to={defaultRedirect} />}
            />
            <RoleChangedModal
                showModal={showRoleModal}
                setShowModal={setShowRoleModal}
                setShowBlockchainModal={setShowBlockchainModal}
            />
            <ConnectBlockchainAccountModal
                showModal={showBlockchainModal}
                setShowModal={setShowBlockchainModal}
            />
        </div>
    );
}
