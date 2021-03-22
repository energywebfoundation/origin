import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { getUserOffchain } from '../../features/users';
import { useLinks } from '../../utils/routing';
import { PageContent } from '../Layout';
import { RoleChangedModal, ConnectBlockchainAccountModal } from '../Modal';
import { CertificateDetailView } from './DetailView';
import { useCertificatesMenu } from './certificateMenu';

function CertificateDetailViewId(id: number) {
    return <CertificateDetailView id={id} />;
}

export function Certificates() {
    const user = useSelector(getUserOffchain);
    const { getCertificatesLink } = useLinks();
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    const certificateMenuList = useCertificatesMenu();

    function getDefaultRedirect() {
        if (user) {
            const allowedRoutes = certificateMenuList.filter((item) => item.show);
            return allowedRoutes[0].key;
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

            <Route path={getCertificatesLink()} render={() => <Redirect to={defaultRedirect} />} />

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
