import React, { useContext } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { History } from 'history';
import { LinearProgress, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { UserStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import {
    Certificates,
    UiCoreAdapter,
    Device,
    Admin,
    Account,
    Organization,
    RequestCertificatesModal,
    AccountMismatchModal,
    ErrorComponent,
    getError,
    getLoading,
    NoBlockchainAccountModal,
    LoginPage,
    getUserOffchain
} from '@energyweb/origin-ui-core';
import { ExchangeApp, ExchangeAdapter } from '@energyweb/exchange-ui-core';
import { useLinks } from '../routing';
import { OriginConfigurationContext } from './OriginConfigurationContext';
import { Header } from './Header';

interface IProps {
    history: History;
}

export function AppContainer(props: IProps) {
    const error = useSelector(getError);
    const loading = useSelector(getLoading);
    const user = useSelector(getUserOffchain);
    const config = useContext(OriginConfigurationContext);
    const store = useStore();

    const shareContextCore = (component) => (
        <UiCoreAdapter
            store={store}
            configuration={config}
            history={props.history}
            component={component}
        />
    );

    const certificatesRoute = shareContextCore(<Certificates />);
    const devicesRoute = shareContextCore(<Device />);
    const loginPageRoute = shareContextCore(<LoginPage />);
    const accountRoute = shareContextCore(<Account />);
    const organizationRoute = shareContextCore(<Organization />);
    const adminRoute = shareContextCore(<Admin />);

    const shareContextExchange = (component) => (
        <ExchangeAdapter
            store={store}
            configuration={config}
            history={props.history}
            component={component}
        />
    );
    const exchangeRoute = shareContextExchange(<ExchangeApp />);

    const {
        baseURL,
        getAccountLink,
        getDevicesLink,
        getCertificatesLink,
        getOrganizationLink,
        getAdminLink,
        getExchangeLink
    } = useLinks();

    const useStyles = makeStyles(() =>
        createStyles({
            progress: {
                backgroundColor: 'rgb(39, 39, 39)'
            },
            progressWrapper: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw'
            }
        })
    );

    const classes = useStyles(useTheme());
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const isIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    if (error) {
        return <ErrorComponent message={error} />;
    }

    return (
        <Switch>
            <Route path={`${baseURL}/user-login`}>{loginPageRoute}</Route>
            <Route>
                <div className="AppWrapper">
                    {loading && (
                        <div className={classes.progressWrapper}>
                            <LinearProgress className={classes.progress} />
                        </div>
                    )}
                    <Header />
                    <Switch>
                        <Route path={getDevicesLink()}>{devicesRoute}</Route>
                        {((enabledFeatures.includes(OriginFeature.Certificates) &&
                            userIsActiveAndPartOfOrg) ||
                            isIssuer) && (
                            <Route path={getCertificatesLink()}>{certificatesRoute}</Route>
                        )}
                        <Route path={getAccountLink()}>{accountRoute}</Route>
                        <Route path={getExchangeLink()}>{exchangeRoute}</Route>
                        <Route
                            path={getOrganizationLink()}
                            render={() => {
                                if (!user) {
                                    return <Redirect to={`${baseURL}/user-login`} />;
                                } else return organizationRoute;
                            }}
                        />
                        <Route path={getAdminLink()}>{adminRoute}</Route>
                        <Route
                            path={baseURL}
                            render={() => {
                                return enabledFeatures.includes(OriginFeature.Devices)
                                    ? devicesRoute
                                    : enabledFeatures.includes(OriginFeature.Exchange)
                                    ? exchangeRoute
                                    : accountRoute;
                            }}
                        />
                    </Switch>
                    <RequestCertificatesModal />
                    <AccountMismatchModal />
                    <NoBlockchainAccountModal />
                </div>
            </Route>
        </Switch>
    );
}
