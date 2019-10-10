import * as React from 'react';
import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
import { Header } from './Header';
import { Asset } from './Asset';
import './AppContainer.scss';
import { Demands } from './Demand/Demands';
import { Account } from './Account/Account';
import { AccountChangedModal } from '../elements/Modal/AccountChangedModal';
import { RequestPasswordModal } from '../elements/Modal/RequestPasswordModal';
import { useSelector } from 'react-redux';
import { ErrorComponent } from './ErrorComponent';
import { LoadingComponent } from './LoadingComponent';
import { getBaseURL } from '../features/selectors';
import {
    getAssetsLink,
    getCertificatesLink,
    getDemandsLink,
    getAccountLink
} from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';

export function AppContainer() {
    const baseURL = useSelector(getBaseURL);
    const error = useSelector(getError);
    const loading = useSelector(getLoading);

    if (error) {
        return <ErrorComponent message={error} />;
    }

    if (loading) {
        return <LoadingComponent />;
    }

    return (
        <div className={`AppWrapper`}>
            <Header />
            <Switch>
                <Route path={getAssetsLink(baseURL)} component={Asset} />
                <Route path={getCertificatesLink(baseURL)} component={Certificates} />
                <Route path={getDemandsLink(baseURL)} component={Demands} />
                <Route path={getAccountLink(baseURL)} component={Account} />

                <Route path={baseURL} component={Asset} />
            </Switch>
            <AccountChangedModal />
            <RequestPasswordModal />
        </div>
    );
}
