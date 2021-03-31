import React, { useState, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';
import {
    useLinks,
    PageContent,
    RoleChangedModal,
    ConnectBlockchainAccountModal,
    fromUsersSelectors,
    fromUsersActions
} from '@energyweb/origin-ui-core';
import { Skeleton } from '@material-ui/lab';
import { initializeDeviceApp, getDeviceClient } from './features/general';
import { DeviceDetailView } from './components/devices/detailView';
import { useDeviceMenu } from './deviceMenu';

export const IRecDeviceApp = memo(() => {
    const dispatch = useDispatch();
    const userOffchain = useSelector(fromUsersSelectors.getUserOffchain);
    const deviceClient = useSelector(getDeviceClient);
    const { baseURL, devicesPageUrl } = useLinks();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    function ProductionDetailView(id: string): JSX.Element {
        return <DeviceDetailView id={id} showCertificates={true} showSmartMeterReadings={true} />;
    }

    useEffect(() => {
        dispatch(initializeDeviceApp());
        if (deviceClient?.accessToken && !userOffchain) {
            dispatch(fromUsersActions.refreshUserOffchain());
        }
    }, []);

    const deviceMenuList = useDeviceMenu();

    if (!deviceClient) {
        return <Skeleton variant="rect" height={200} />;
    }

    return (
        <div className="PageWrapper">
            <Route
                path={`${devicesPageUrl}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = deviceMenuList.filter((item) => {
                        return item.key === key;
                    });

                    if (matches.length > 0 && key === 'producing_detail_view') {
                        matches[0].component = () =>
                            ProductionDetailView(String(id ? parseInt(id, 10) : id));
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={devicesPageUrl}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={devicesPageUrl}
                render={() => (
                    <Redirect to={{ pathname: `${devicesPageUrl}/${deviceMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${devicesPageUrl}/${deviceMenuList[0].key}` }} />
                )}
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
});

IRecDeviceApp.displayName = 'IRecDeviceApp';
