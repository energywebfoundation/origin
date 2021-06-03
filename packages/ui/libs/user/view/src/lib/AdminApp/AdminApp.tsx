import React from 'react';

import { Route, Routes } from 'react-router';
import AdminManageUsersPage from '../pages/admin-manage-users-page/AdminManageUsersPage';
import AdminManageUserClaimsPage from '../pages/admin-manage-user-claims/AdminManageUserClaimsPage';
import AdminUpdateUserPage from '../pages/admin-update-user-page/AdminUpdateUserPage';
import { useAdminAppEffects } from './AdminApp.effects';

export const AdminApp = () => {
  const { setEditUserData, editedUserData } = useAdminAppEffects();

  return (
    <Routes>
      <Route
        path="users"
        element={
          <AdminManageUsersPage
            handleSetEditUserData={(el) => setEditUserData(el)}
          />
        }
      />
      <Route
        path="update-user"
        element={<AdminUpdateUserPage userData={editedUserData} userId={1} />}
      />
      <Route path="claims" element={<AdminManageUserClaimsPage />} />
    </Routes>
  );
};
