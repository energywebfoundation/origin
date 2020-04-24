import React from 'react';
import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
import { Header } from './Header';
import { Device } from './Device';
import { Admin } from './Admin';
import { Account } from './Account/Account';
import { Organization } from './Organization/Organization';
import { RequestCertificatesModal, AccountMismatchModal } from './Modal';
import { useSelector } from 'react-redux';
import { ErrorComponent } from './ErrorComponent';
import { useLinks } from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';
import { LinearProgress, makeStyles, createStyles, useTheme } from '@material-ui/core';

export function AppContainer() {
    const error = useSelector(getError);
    const loading = useSelector(getLoading);

    const {
        baseURL,
        getAccountLink,
        getDevicesLink,
        getCertificatesLink,
        getOrganizationLink,
        getAdminLink
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

    if (error) {
        return <ErrorComponent message={error} />;
    }

    return (
        <div className={`AppWrapper`}>
            {loading && (
                <div className={classes.progressWrapper}>
                    <LinearProgress className={classes.progress} />
                </div>
            )}
            <Header />
            <Switch>
                <Route path={getDevicesLink()} component={Device} />
                <Route path={getCertificatesLink()} component={Certificates} />
                <Route path={getAccountLink()} component={Account} />
                <Route path={getOrganizationLink()} component={Organization} />
                <Route path={getAdminLink()} component={Admin} />

                <Route path={baseURL} component={Device} />
            </Switch>
            <RequestCertificatesModal />
            <AccountMismatchModal />
        </div>
    );
}
