import React from 'react';
import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
import { Header } from './Header';
import { Asset } from './Asset';
import './AppContainer.scss';
import { Demands } from './Demand/Demands';
import { Account } from './Account/Account';
import { AccountChangedModal } from '../elements/Modal/AccountChangedModal';
import { RequestPasswordModal } from '../elements/Modal/RequestPasswordModal';
import { RequestIRECsModal } from '../elements/Modal/RequestIRECsModal';
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
        getDemandsLink,
        getAssetsLink,
        getCertificatesLink
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
                <Route path={getAssetsLink()} component={Asset} />
                <Route path={getCertificatesLink()} component={Certificates} />
                <Route path={getDemandsLink()} component={Demands} />
                <Route path={getAccountLink()} component={Account} />

                <Route path={baseURL} component={Asset} />
            </Switch>
            <AccountChangedModal />
            <RequestPasswordModal />
            <RequestIRECsModal />
        </div>
    );
}
