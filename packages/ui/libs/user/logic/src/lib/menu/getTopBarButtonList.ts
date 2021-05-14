import { TopBarButtonData } from '@energyweb/origin-ui-core';

export const getTopBarButtonList = (
  isAuthenticated: boolean,
  onLogout: () => void
): TopBarButtonData[] => {
  return [
    {
      label: 'Register',
      url: '/auth/register',
      onClick: () => {
        console.log('Register clicked');
      },
      show: !isAuthenticated,
    },
    {
      label: 'Login',
      url: '/auth/login',
      show: !isAuthenticated,
      onClick: () => {
        console.log('Login clicked');
      },
    },
    {
      label: 'Logout',
      show: isAuthenticated,
      onClick: () => {
        onLogout();
      },
    },
  ];
};
