import React, { useContext, useState } from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Role, isRole, UserStatus } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { PageContent } from '../PageContent/PageContent';
import { CertificateTable, SelectedState } from './CertificateTable';
import { CertificateDetailView } from './CertificateDetailView';
import { CertificationRequestsTable } from './CertificationRequestsTable';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users/selectors';
import { getCurrencies } from '../../features/general/selectors';
import { useTranslation } from 'react-i18next';
import { Exchange, MyTrades } from '../exchange';
import { useLinks } from '../../utils';
import { BundlesTable } from '../bundles/BundlesTable';
import { CreateBundleForm } from '../bundles/CreateBundleForm';
import { MyOrders } from '../orders/MyOrders';
import { OriginConfigurationContext } from '..';
import { RoleChangedModal } from '../Modal/RoleChangedModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';

function CertificateDetailViewId(id: number) {
    return <CertificateDetailView id={id} />;
}

function InboxCertificates() {
    return <CertificateTable selectedState={SelectedState.Inbox} />;
}

function ClaimedCertificates() {
    return <CertificateTable selectedState={SelectedState.Claimed} hiddenColumns={['source']} />;
}

const PendingCertificationRequestsTable = () => <CertificationRequestsTable approved={false} />;

const ApprovedCertificationRequestsTable = () => <CertificationRequestsTable approved={true} />;

export function Certificates() {
    const currencies = useSelector(getCurrencies);
    const user = useSelector(getUserOffchain);
    const { baseURL, getCertificatesLink } = useLinks();
    const { t } = useTranslation();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    const originConfiguration = useContext(OriginConfigurationContext);

    const defaultCurrency = (currencies && currencies[0]) ?? 'USD';

    const ExchangeRoute = () => <Exchange currency={defaultCurrency} />;
    const TradesRoute = () => <MyTrades currency={defaultCurrency} />;

    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;

    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    const CertificatesMenu = [
        {
            key: 'inbox',
            label: 'navigation.certificates.inbox',
            component: InboxCertificates,
            show: userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'claims_report',
            label: 'navigation.certificates.claimsReport',
            component: ClaimedCertificates,
            show: isIssuer || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.Buyer]
        },
        {
            key: 'detail_view',
            label: 'navigation.certificates.detailView',
            component: null,
            show: false,
            features: [OriginFeature.Certificates]
        },
        {
            key: 'pending',
            label: 'navigation.certificates.pending',
            component: PendingCertificationRequestsTable,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'approved',
            label: 'navigation.certificates.approved',
            component: ApprovedCertificationRequestsTable,
            show: (userIsActive && isIssuer) || userIsActiveAndPartOfOrg,
            features: [OriginFeature.Certificates, OriginFeature.CertificationRequests]
        },
        {
            key: 'exchange',
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
    const authenticationToken = localStorage.getItem('AUTHENTICATION_TOKEN');

    function getDefaultRedirect() {
        if (user) {
            if (isIssuer) {
                return CertificatesMenu[3].key;
            }

            return CertificatesMenu.filter((i) => i.show)[0]?.key;
        }

        return CertificatesMenu[5].key;
    }

    const defaultRedirect = {
        pathname: `${getCertificatesLink()}/${getDefaultRedirect()}`
    };

    return (
        (user || !authenticationToken) && (
            <div className="PageWrapper">
                <div className="PageNav">
                    <ul className="NavMenu nav">
                        {CertificatesMenu.map((menu) => {
                            if (
                                menu.show &&
                                menu.features.every((flag) =>
                                    originConfiguration.enabledFeatures.includes(flag)
                                )
                            ) {
                                const link = `${getCertificatesLink()}/${menu.key}`;

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
                    path={`${getCertificatesLink()}/:key/:id?`}
                    render={(props) => {
                        const key = props.match.params.key;
                        const id = props.match.params.id as string;
                        const matches = CertificatesMenu.filter((item) => {
                            return item.key === key;
                        });
                        if (matches.length > 0) {
                            if (key === 'detail_view') {
                                matches[0].component = () =>
                                    CertificateDetailViewId(parseInt(id, 10));
                            }
                        }

                        return (
                            <PageContent
                                menu={matches.length > 0 ? matches[0] : null}
                                redirectPath={getCertificatesLink()}
                            />
                        );
                    }}
                />

                <Route
                    exact={true}
                    path={getCertificatesLink()}
                    render={() => <Redirect to={defaultRedirect} />}
                />

                <Route
                    exact={true}
                    path={`${baseURL}/`}
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
        )
    );
}
