import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrganizationModalsCenter } from './containers';
import { OrganizationModalsProvider } from './context';

const OrganizationViewPage = lazy(
  () => import('./pages/OrganizationViewPage/OrganizationViewPage')
);
const InvitationsPage = lazy(
  () => import('./pages/InvitationsPage/InvitationsPage')
);
const InvitePage = lazy(() => import('./pages/InvitePage/InvitePage'));
const MembersPage = lazy(() => import('./pages/MembersPage/MembersPage'));
const AllOrganizationsPage = lazy(
  () => import('./pages/AllOrganizationsPage/AllOrganizationsPage')
);
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const RegisterIRecPage = lazy(
  () => import('./pages/RegisterIRecPage/RegisterIRecPage')
);
const CreateBeneficiaryPage = lazy(
  () => import('./pages/CreateBeneficiaryPage/CreateBeneficiaryPage')
);
const ConnectIRecPage = lazy(
  () => import('./pages/ConnectIRecPage/ConnectIRecPage')
);

export interface OrganizationAppProps {
  routesConfig: {
    showRegisterOrg: boolean;
    showMyOrg: boolean;
    showMembers: boolean;
    showInvitations: boolean;
    showInvite: boolean;
    showAllOrgs: boolean;
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
    showAllOrgs,
    showRegisterIRec,
    showCreateBeneficiary,
    showConnectIRec,
  } = routesConfig;

  return (
    <OrganizationModalsProvider>
      <Routes>
        {showMyOrg && (
          <Route
            path="my"
            element={
              <Suspense fallback={<CircularProgress />}>
                <OrganizationViewPage />
              </Suspense>
            }
          />
        )}
        {showInvitations && (
          <Route
            path="invitations"
            element={
              <Suspense fallback={<CircularProgress />}>
                <InvitationsPage />
              </Suspense>
            }
          />
        )}
        {showInvite && (
          <Route
            path="invite"
            element={
              <Suspense fallback={<CircularProgress />}>
                <InvitePage />
              </Suspense>
            }
          />
        )}
        {showMembers && (
          <Route
            path="members"
            element={
              <Suspense fallback={<CircularProgress />}>
                <MembersPage />
              </Suspense>
            }
          />
        )}
        {showAllOrgs && (
          <Route
            path="all"
            element={
              <Suspense fallback={<CircularProgress />}>
                <AllOrganizationsPage />
              </Suspense>
            }
          />
        )}
        {showRegisterOrg && (
          <Route
            path="register"
            element={
              <Suspense fallback={<CircularProgress />}>
                <RegisterPage />
              </Suspense>
            }
          />
        )}
        {showRegisterIRec && (
          <Route
            path="register-irec"
            element={
              <Suspense fallback={<CircularProgress />}>
                <RegisterIRecPage />
              </Suspense>
            }
          />
        )}
        {showCreateBeneficiary && (
          <Route
            path="create-beneficiary"
            element={
              <Suspense fallback={<CircularProgress />}>
                <CreateBeneficiaryPage />
              </Suspense>
            }
          />
        )}
        {showConnectIRec && (
          <Route
            path="connect-irec"
            element={
              <Suspense fallback={<CircularProgress />}>
                <ConnectIRecPage />
              </Suspense>
            }
          />
        )}

        <Route path="*" element={<PageNotFound />} />
      </Routes>

      <OrganizationModalsCenter />
    </OrganizationModalsProvider>
  );
};
