import React, { useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Role, isRole } from '@energyweb/origin-backend-core';
import { PageContent } from '../PageContent/PageContent';
import { CertificateDetailView } from './CertificateDetailView';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users/selectors';
import { useLinks } from '../../utils';
import { RoleChangedModal } from '../Modal/RoleChangedModal';
import { ConnectBlockchainAccountModal } from '../Modal/ConnectBlockchainAccountModal';
import { certificatesMenuCreator } from './certificateMenuCreator';

function CertificateDetailViewId(id: number) {
    return <CertificateDetailView id={id} />;
}

export function Certificates() {
    const user = useSelector(getUserOffchain);
    const { baseURL, getCertificatesLink } = useLinks();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    const isIssuer = isRole(user, Role.Issuer);

    const certificateMenuList = certificatesMenuCreator(user);

    function getDefaultRedirect() {
        if (user) {
            if (isIssuer) {
                return certificateMenuList[3].key;
            }
            return certificateMenuList[0].key;
        }
    }

    const defaultRedirect = {
        pathname: `${getCertificatesLink()}/${getDefaultRedirect()}`
    };

    return (
        <div className="PageWrapper">
            <Route
                path={`${getCertificatesLink()}/:key/:id?`}
                render={(props) => {
                    const key = props.match.params.key;
                    const id = props.match.params.id as string;
                    const matches = certificateMenuList.filter((item) => {
                        return item.key === key;
                    });
                    if (matches.length > 0) {
                        if (key === 'detail_view') {
                            matches[0].component = () => CertificateDetailViewId(parseInt(id, 10));
                        }
                    }

                    return (
                        <PageContent
                            menu={matches.length > 0 ? matches[0] : null}
                            redirectPath={getCertificatesLink()}
                        />
                    );
                }}
            />

            <Route
                exact={true}
                path={getCertificatesLink()}
                render={() => <Redirect to={defaultRedirect} />}
            />

            <Route
                exact={true}
                path={`${baseURL}/`}
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
