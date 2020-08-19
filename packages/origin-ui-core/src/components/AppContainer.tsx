import React, { useContext } from 'react';
import { OriginFeature } from '@energyweb/utils-general';
import { Certificates } from './certificates/Certificates';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Header } from './Header';
import { Device } from './devices/Device';
import { Admin } from './admin/Admin';
import { Account } from './Account/Account';
import { Organization } from './Organization/Organization';
import { RequestCertificatesModal, AccountMismatchModal } from './Modal';
import { useSelector } from 'react-redux';
import { ErrorComponent } from './ErrorComponent';
import { useLinks } from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';
import { LinearProgress, makeStyles, createStyles, useTheme } from '@material-ui/core';
import { BundlesTable } from './bundles/BundlesTable';
import { NoBlockchainAccountModal } from './Modal/NoBlockchainAccountModal';
import { FeatureRoute } from './route/FeatureRoute';
import { OriginConfigurationContext } from '.';
import { LoginPage } from './Account/LoginPage';
import { PendingInvitationsModal } from './Modal/PendingInvitationsModal';
import { RoleChangedModal } from './Modal/RoleChangedModal';
import { NoExistingInvitationModal } from './Modal/NoExistingInvitationModal';
import { getUserOffchain } from '../features/users/selectors';

export function AppContainer() {
    const error = useSelector(getError);
    const loading = useSelector(getLoading);
    const user = useSelector(getUserOffchain);

    const {
        baseURL,
        getAccountLink,
        getDevicesLink,
        getCertificatesLink,
        getOrganizationLink,
        getAdminLink,
        getBundlesLink
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

    if (error) {
        return <ErrorComponent message={error} />;
    }

    return (
        <Switch>
            <Route path={`${baseURL}/user-login`} component={LoginPage} />
            <Route>
                <div className={`AppWrapper`}>
                    {loading && (
                        <div className={classes.progressWrapper}>
                            <LinearProgress className={classes.progress} />
                        </div>
                    )}
                    <Header />
                    <Switch>
                        <FeatureRoute
                            path={getDevicesLink()}
                            component={Device}
                            forFeatures={[OriginFeature.Devices]}
                        />
                        <FeatureRoute
                            path={getCertificatesLink()}
                            component={Certificates}
                            forFeatures={[OriginFeature.Certificates]}
                        />
                        <Route path={getAccountLink()} component={Account} />
                        <Route
                            path={getOrganizationLink()}
                            render={() => {
                                if (!user) {
                                    return <Redirect to={`${baseURL}/user-login`} />;
                                } else return <Organization />;
                            }}
                        />
                        <Route path={getAdminLink()} component={Admin} />
                        <FeatureRoute
                            path={getBundlesLink()}
                            component={BundlesTable}
                            forFeatures={[OriginFeature.Bundles, OriginFeature.Certificates]}
                        />
                        <Route
                            path={baseURL}
                            component={
                                enabledFeatures.includes(OriginFeature.Devices)
                                    ? Device
                                    : enabledFeatures.includes(OriginFeature.Certificates)
                                    ? Certificates
                                    : Account
                            }
                        />
                    </Switch>
                    <RequestCertificatesModal />
                    <AccountMismatchModal />
                    <NoBlockchainAccountModal />
                    <PendingInvitationsModal />
                    <RoleChangedModal />
                    <NoExistingInvitationModal />
                </div>
            </Route>
        </Switch>
    );
}
