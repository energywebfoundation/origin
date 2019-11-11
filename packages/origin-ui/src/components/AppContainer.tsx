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
import { RequestIRECsModal } from '../elements/Modal/RequestIRECsModal';
import { useSelector } from 'react-redux';
import { ErrorComponent } from './ErrorComponent';
import { LoadingComponent } from './LoadingComponent';
import { useLinks } from '../utils/routing';
import { getError, getLoading } from '../features/general/selectors';

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
