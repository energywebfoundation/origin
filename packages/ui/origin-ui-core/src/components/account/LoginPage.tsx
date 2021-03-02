import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { OrganizationInvitationStatus, OrganizationStatus } from '@energyweb/origin-backend-core';
import { getUserState } from '../../features/users';
import { useLinks } from '../../utils';
import { useOriginConfiguration } from '../../utils/configuration';
import {
    CreateDepositAddressModal,
    LoginNoInvitationsModal,
    PendingInvitationsModal
} from '../Modal';
import { LoginForm } from './LoginForm';

interface IOwnProps {
    redirect?: string;
}

export const LoginPage = (props: IOwnProps): JSX.Element => {
    const userState = useSelector(getUserState);
    const user = userState.userOffchain;
    const pending = userState.invitations.invitations.filter(
        (i) => i.status === OrganizationInvitationStatus.Pending
    );
    const showInvitations = pending.length > 0 && !user?.organization?.id;
    const { getDefaultLink } = useLinks();
    const history = useHistory();
    const configuration = useOriginConfiguration();

    const [showRegisterOrganizationModal, setShowRegisterOrganizationModal] = useState(false);
    const [showAddAddressModel, setShowAddAddressModel] = useState(false);
    const [showInvitationsModal, setShowInvitationsModal] = useState(false);

    useEffect(() => {
        if (user) {
            if (!showInvitations) {
                const FIRST_LOGIN_KEY = `FIRST LOGIN ${user.id}`;
                const ORG_RECENTLY_ACTIVATED_ORG_KEY = `ORG ACTIVE ${user.id}`;
                let firstLoginItem = localStorage.getItem(FIRST_LOGIN_KEY);
                const orgRecentlyRegistered = localStorage.getItem(ORG_RECENTLY_ACTIVATED_ORG_KEY);
                if (!firstLoginItem && user.organization?.id) {
                    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
                    firstLoginItem = 'true';
                }
                if (firstLoginItem) {
                    if (
                        user.organization &&
                        !orgRecentlyRegistered &&
                        user.organization.status === OrganizationStatus.Active
                    ) {
                        localStorage.setItem(ORG_RECENTLY_ACTIVATED_ORG_KEY, 'true');
                        setShowAddAddressModel(true);
                    } else {
                        history.push(props.redirect || getDefaultLink());
                    }
                } else {
                    localStorage.setItem(FIRST_LOGIN_KEY, 'true');
                    setShowRegisterOrganizationModal(true);
                }
            } else {
                setShowInvitationsModal(true);
            }
        }
    }, [userState]);

    return (
        <div className="LoginPage">
            {configuration.loginPageBg}
            <LoginForm />
            <LoginNoInvitationsModal
                showModal={showRegisterOrganizationModal}
                setShowModal={setShowRegisterOrganizationModal}
            />
            <PendingInvitationsModal
                showModal={showInvitationsModal}
                setShowModal={setShowInvitationsModal}
                invitations={pending}
            />
            <CreateDepositAddressModal
                showModal={showAddAddressModel}
                setShowModal={setShowAddAddressModel}
            />
        </div>
    );
};
