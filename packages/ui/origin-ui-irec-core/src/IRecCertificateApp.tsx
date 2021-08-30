import React, { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    useLinks,
    PageContent,
    RoleChangedModal,
    ConnectBlockchainAccountModal,
    fromUsersSelectors
} from '@energyweb/origin-ui-core';
import { CertificateDetailView } from './components/certificates/detailView';
import { useCertificatesMenu } from './certificateMenu';

function CertificateDetailViewId(id: number) {
    return <CertificateDetailView id={id} />;
}

export const IRecCertificateApp = (): ReactElement => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const { certificatesPageUrl } = useLinks();
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
        pathname: `${certificatesPageUrl}/${getDefaultRedirect()}`
    };

    return (
        <div className="PageWrapper">
            <Route
                path={`${certificatesPageUrl}/:key/:id?`}
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
                            redirectPath={certificatesPageUrl}
                        />
                    );
                }}
            />

            <Route path={certificatesPageUrl} render={() => <Redirect to={defaultRedirect} />} />

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
};
