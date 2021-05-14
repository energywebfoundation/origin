import React, { memo, useEffect } from 'react';

import { useLogoutPageEffects } from './LogoutPage.effects';

/* eslint-disable-next-line */
export interface LogoutPageProps {
  handleSuccess?: () => void;
}

export const LogoutPage = memo(({ handleSuccess }: LogoutPageProps) => {
  const { logoutUser } = useLogoutPageEffects();
  useEffect(() => {
    logoutUser();
    handleSuccess && handleSuccess();
  }, []);
  return <h1>Logged out!</h1>;
});

export default LogoutPage;
