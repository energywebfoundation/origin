import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrganizationModalsCenter } from './containers';
import { OrganizationModalsProvider } from './context';
import {
  ConnectIRecPage,
  CreateBeneficiaryPage,
  InvitationsPage,
  InvitePage,
  MembersPage,
  OrganizationViewPage,
  RegisterIRecPage,
  RegisterPage,
} from './pages';

export interface OrganizationAppProps {
  routesConfig: {
    showRegisterOrg: boolean;
    showMyOrg: boolean;
    showMembers: boolean;
    showInvitations: boolean;
    showInvite: boolean;
    showRegisterIRec: boolean;
    showCreateBeneficiary: boolean;
    showConnectIRec: boolean;
  };
}

export const OrganizationApp: FC<OrganizationAppProps> = ({ routesConfig }) => {
  const {
    showRegisterOrg,
    showMyOrg,
    showMembers,
    showInvitations,
    showInvite,
    showRegisterIRec,
    showCreateBeneficiary,
    showConnectIRec,
  } = routesConfig;

  return (
    <OrganizationModalsProvider>
      <Routes>
        {showMyOrg && <Route path="my" element={<OrganizationViewPage />} />}
        <Route
          path="invitations"
          element={<InvitationsPage redirectToIndex={!showInvitations} />}
        />
        {showInvite && <Route path="invite" element={<InvitePage />} />}
        {showMembers && <Route path="members" element={<MembersPage />} />}
        {showRegisterOrg && (
          <Route path="register" element={<RegisterPage />} />
        )}
        {showRegisterIRec && (
          <Route path="register-irec" element={<RegisterIRecPage />} />
        )}
        {showCreateBeneficiary && (
          <Route
            path="create-beneficiary"
            element={<CreateBeneficiaryPage />}
          />
        )}
        {showConnectIRec && (
          <Route path="connect-irec" element={<ConnectIRecPage />} />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <OrganizationModalsCenter />
    </OrganizationModalsProvider>
  );
};
