import React, { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  RegisterPage,
  RegisterIRecPage,
  MyOrganizationPage,
  InvitationsPage,
  MembersPage,
  InvitePage,
} from './pages';

export const OrganizationApp: FC = () => {
  return (
    <Routes>
      <Route path="my" element={<MyOrganizationPage />} />

      <Route path="invitations" element={<InvitationsPage />} />

      <Route path="invite" element={<InvitePage />} />

      <Route path="members" element={<MembersPage />} />

      <Route path="register" element={<RegisterPage />} />

      <Route path="register-irec" element={<RegisterIRecPage />} />
    </Routes>
  );
};
