import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    useLinks,
    getUserOffchain,
    PageContent,
    RoleChangedModal,
    ConnectBlockchainAccountModal,
    refreshUserOffchain
} from '@energyweb/origin-ui-core';
import { initializeExchangeApp, getExchangeClient } from './features/general';
import { useExchangeMenu } from './exchangeMenu';

export function ExchangeApp() {
    const dispatch = useDispatch();
    const userOffchain = useSelector(getUserOffchain);
    const exchangeClient = useSelector(getExchangeClient);
    const { getExchangeLink } = useLinks();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    useEffect(() => {
        dispatch(initializeExchangeApp());

        if (exchangeClient?.accessToken && !userOffchain) {
            dispatch(refreshUserOffchain());
        }
    }, [userOffchain]);

    const exchangeMenuList = useExchangeMenu();

    const defaultRedirect = {
        pathname: `${getExchangeLink()}/${exchangeMenuList[0].key}`
    };

    return (
        <div className="PageWrapper">
            <Route
                path={`${getExchangeLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const matches = exchangeMenuList.filter((item) => {
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
