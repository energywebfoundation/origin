import React from 'react';
import { AuthApp, AuthAppProps } from '@energyweb/origin-ui-user-view';

const AuthRoute = (props: AuthAppProps) => {
  return <AuthApp {...props} />;
};

export default AuthRoute;
