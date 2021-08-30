import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    PageContent,
    RoleChangedModal,
    ConnectBlockchainAccountModal,
    fromUsersActions,
    fromUsersSelectors
} from '@energyweb/origin-ui-core';
import { initializeExchangeApp, getExchangeClient } from './features';
import { useExchangeMenu } from './hooks';
import { ErrorBoundary } from 'react-error-boundary';

interface IProps {
    exchangePageUrl?: string;
    defaultRedirect?: string;
}

export const ExchangeApp = memo(
    ({ exchangePageUrl = '/exchange', defaultRedirect = '/exchange/view-market' }: IProps) => {
        const dispatch = useDispatch();
        const userOffchain = useSelector(fromUsersSelectors.getUserOffchain);
        const exchangeClient = useSelector(getExchangeClient);
        const [showRoleModal, setShowRoleModal] = useState(false);
        const [showBlockchainModal, setShowBlockchainModal] = useState(false);
        useEffect(() => {
            dispatch(initializeExchangeApp());

            if (exchangeClient?.accessToken && !userOffchain) {
                dispatch(fromUsersActions.refreshUserOffchain());
            }
        }, [userOffchain]);

        const exchangeMenuList = useExchangeMenu();
        return (
            <div className="PageWrapper">
                <Route
                    path={`${exchangePageUrl}/:key/:id?`}
                    render={(props) => {
                        const key = props.match.params.key;
                        const matches = exchangeMenuList.filter((item) => {
                            return item.key === key;
                        });

                        return (
                            <ErrorBoundary
                                fallbackRender={() => (
                                    <div style={{ padding: 40 }}>PageWrapper Error</div>
                                )}
                            >
                                <PageContent
                                    menu={matches.length > 0 ? matches[0] : null}
                                    redirectPath={exchangePageUrl}
                                />
                            </ErrorBoundary>
                        );
                    }}
                />
                <Route path={exchangePageUrl} render={() => <Redirect to={defaultRedirect} />} />
                <Route
                    exact={true}
                    path={exchangePageUrl}
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
);

ExchangeApp.displayName = 'ExchangeApp';
