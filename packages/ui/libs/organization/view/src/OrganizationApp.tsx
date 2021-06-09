import React, { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { OrganizationModalsCenter } from './containers';
import { OrganizationModalsProvider } from './context';
import {
  RegisterPage,
  RegisterIRecPage,
  OrganizationViewPage,
  InvitationsPage,
  MembersPage,
  InvitePage,
  AllOrganizationsPage,
} from './pages';

export const OrganizationApp: FC = () => {
  return (
    <OrganizationModalsProvider>
      <Routes>
        <Route path="my" element={<OrganizationViewPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="invite" element={<InvitePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="all" element={<AllOrganizationsPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="register-irec" element={<RegisterIRecPage />} />
      </Routes>

      <OrganizationModalsCenter />
    </OrganizationModalsProvider>
  );
};
