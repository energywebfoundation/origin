import { useState } from 'react';
import { UserDTO } from '@energyweb/origin-backend-client';

export const useAdminAppEffects = () => {
  const [editedUserData, setEditUserData] = useState<UserDTO>();

  return { editedUserData, setEditUserData };
};
