import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useLinks } from '../../utils';
import { PageContent } from '../Layout/PageContent';
import { DeviceDetailView } from './DetailView';
import { RoleChangedModal } from '../Modal/RoleChangedModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';
import { useDeviceMenu } from './deviceMenu';

export function Device() {
    const { baseURL, getDevicesLink } = useLinks();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    function ProductionDetailView(id: number): JSX.Element {
        return <DeviceDetailView id={id} showCertificates={true} showSmartMeterReadings={true} />;
    }

    const deviceMenuList = useDeviceMenu();

    return (
        <div className="PageWrapper">
            <Route
                path={`${getDevicesLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id;
                    const matches = deviceMenuList.filter((item) => {
                        return item.key === key;
                    });

                    if (matches.length > 0 && key === 'producing_detail_view') {
                        matches[0].component = () => ProductionDetailView(parseInt(id, 10));
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getDevicesLink()}
                        />
                    );
                }}
            />
            <Route
                exact={true}
                path={getDevicesLink()}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${deviceMenuList[0].key}` }} />
                )}
            />
            <Route
                exact={true}
                path={`${baseURL}/`}
                render={() => (
                    <Redirect to={{ pathname: `${getDevicesLink()}/${deviceMenuList[0].key}` }} />
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
}
