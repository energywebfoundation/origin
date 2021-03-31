import React, { ReactElement, useContext, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { History } from 'history';
import { LinearProgress, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { UserStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import {
    Certificates,
    UiCoreAdapter,
    Device,
    Admin,
    Account,
    Organization,
    AccountMismatchModal,
    ErrorComponent,
    NoBlockchainAccountModal,
    LoginPage,
    DeviceDataLayers,
    fromGeneralSelectors,
    fromUsersSelectors,
    useLinks
} from '@energyweb/origin-ui-core';
import { ExchangeApp, ExchangeAdapter } from '@energyweb/exchange-ui-core';
import { OriginConfigurationContext } from './OriginConfigurationContext';
import { Header } from './Header';
import { IRecCoreAdapter, IRecDeviceApp, IRecCertificateApp } from '@energyweb/origin-ui-irec-core';
import { SidebarMenuContainer } from '../containers/SidebarMenuContainer';

interface IProps {
    history: History;
}

export const AppContainer = (props: IProps): ReactElement => {
    const error = useSelector(fromGeneralSelectors.getError);
    const loading = useSelector(fromGeneralSelectors.getLoading);
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const config = useContext(OriginConfigurationContext);
    const store = useStore();

    const originConfiguration = useContext(OriginConfigurationContext);
    const enabledFeatures = originConfiguration?.enabledFeatures;
    const changeContext = originConfiguration?.changeContext;
    const environment = useSelector(fromGeneralSelectors.getEnvironment);
    useEffect(() => {
        if (environment?.DISABLED_UI_FEATURES) {
            const disabledFeatures = environment?.DISABLED_UI_FEATURES.split(';').map(
                (feature) => OriginFeature[feature]
            );
            const newEnabledFeatures = allOriginFeatures.filter(
                (feature) => !disabledFeatures.includes(feature)
            );
            const isEqual = enabledFeatures.join(',') === newEnabledFeatures.join(',');
            if (!isEqual) {
                changeContext({ ...originConfiguration, enabledFeatures: newEnabledFeatures });
            }
        }
    }, [environment]);

    const shareContextCore = (component) => (
        <UiCoreAdapter
            store={store}
            configuration={config}
            history={props.history}
            component={component}
        />
    );

    const certificatesCoreRoute = shareContextCore(<Certificates />);
    const devicesCoreRoute = shareContextCore(<Device />);
    const loginPageRoute = shareContextCore(<LoginPage />);
    const accountRoute = shareContextCore(<Account />);
    const organizationRoute = shareContextCore(<Organization />);
    const adminRoute = shareContextCore(<Admin />);

    const exchangeDeviceDataLayer = enabledFeatures?.includes(OriginFeature.IRecUIApp)
        ? DeviceDataLayers.IRecDevice
        : DeviceDataLayers.OriginFormDevice;

    const {
        accountPageUrl,
        adminPageUrl,
        baseURL,
        certificatesPageUrl,
        devicesPageUrl,
        organizationPageUrl,
        exchangePageUrl
    } = useLinks();

    const shareContextExchange = (component) => (
        <ExchangeAdapter
            store={store}
            configuration={config}
            history={props.history}
            component={component}
            deviceDataLayer={exchangeDeviceDataLayer}
        />
    );
    const exchangeRoute = shareContextExchange(<ExchangeApp />);

    const shareContextIRec = (component) => (
        <IRecCoreAdapter
            store={store}
            configuration={config}
            history={props.history}
            component={component}
        />
    );
    const iRecCertificateRoute = shareContextIRec(<IRecCertificateApp />);
    const iRecDeviceRoute = shareContextIRec(<IRecDeviceApp />);

    const certificateRoute = enabledFeatures?.includes(OriginFeature.IRecUIApp)
        ? iRecCertificateRoute
        : certificatesCoreRoute;

    const deviceRoute = enabledFeatures?.includes(OriginFeature.IRecUIApp)
        ? iRecDeviceRoute
        : devicesCoreRoute;

    const useStyles = makeStyles(() =>
        createStyles({
            progress: {
                backgroundColor: 'rgb(39, 39, 39)'
            },
            progressWrapper: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                zIndex: 100
            }
        })
    );

    const classes = useStyles(useTheme());

    const isUserIssuer = isRole(user, Role.Issuer);
    const userIsActive = user && user.status === UserStatus.Active;
    const userIsActiveAndPartOfOrg =
        user?.organization &&
        userIsActive &&
        isRole(user, Role.OrganizationUser, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    if (error) {
        return <ErrorComponent message={error} />;
    }

    if (environment === null) {
        return <></>;
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
                    <SidebarMenuContainer />
                    <Switch>
                        <Route path={devicesPageUrl}>{deviceRoute}</Route>
                        {((enabledFeatures.includes(OriginFeature.Certificates) &&
                            userIsActiveAndPartOfOrg) ||
                            isUserIssuer) && (
                            <Route path={certificatesPageUrl}>{certificateRoute}</Route>
                        )}
                        <Route path={accountPageUrl}>{accountRoute}</Route>
                        <Route path={exchangePageUrl}>{exchangeRoute}</Route>
                        <Route
                            path={organizationPageUrl}
                            render={() => {
                                if (!user) {
                                    return <Redirect to={`${baseURL}/user-login`} />;
                                } else return organizationRoute;
                            }}
                        />
                        <Route path={adminPageUrl}>{adminRoute}</Route>
                        <Route
                            path={baseURL}
                            render={() => {
                                return enabledFeatures.includes(OriginFeature.Devices)
                                    ? deviceRoute
                                    : enabledFeatures.includes(OriginFeature.Exchange)
                                    ? exchangeRoute
                                    : accountRoute;
                            }}
                        />
                    </Switch>
                    <AccountMismatchModal />
                    <NoBlockchainAccountModal />
                </div>
            </Route>
        </Switch>
    );
};
